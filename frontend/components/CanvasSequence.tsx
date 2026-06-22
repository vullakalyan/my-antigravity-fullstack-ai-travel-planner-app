'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';

interface CanvasSequenceProps {
  frameCount: number;
  framePrefix: string;
  frameSuffix?: string;
  padLength?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * Scroll-driven Canvas Sequence Animation.
 * 
 * IMPORTANT: The image frames must be placed in `public/sequence/` directory.
 * E.g., `public/sequence/ezgif-frame-001.jpg`
 */
export default function CanvasSequence({
  frameCount,
  framePrefix,
  frameSuffix = '.jpg',
  padLength = 3,
  className,
  children,
}: CanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile to degrade gracefully
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload images
  useEffect(() => {
    if (isMobile) {
      // Just load the first and last frame for mobile fallback
      const img1 = new Image();
      img1.src = `${framePrefix}${'1'.padStart(padLength, '0')}${frameSuffix}`;
      img1.onload = () => {
        setLoadedCount(1);
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
            drawFrame(img1, ctx);
          }
        }
      };
      setImages([img1]);
      return;
    }

    let loaded = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(padLength, '0');
      img.src = `${framePrefix}${frameNum}${frameSuffix}`;
      
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (i === 1 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
            drawFrame(img, ctx);
          }
        }
      };
      imgs.push(img);
    }
    setImages(imgs);
  }, [frameCount, framePrefix, frameSuffix, padLength, isMobile]);

  const drawFrame = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  // Scroll animation
  useEffect(() => {
    if (images.length === 0 || isMobile) return;

    let rafId: number;
    let currentFrame = 0;

    const render = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScrollDistance = rect.height - windowHeight;
      const currentScroll = -rect.top;
      
      let progress = currentScroll / totalScrollDistance;
      progress = Math.max(0, Math.min(1, progress));

      const targetFrame = Math.floor(progress * (frameCount - 1));

      if (targetFrame !== currentFrame && images[targetFrame]?.complete) {
        currentFrame = targetFrame;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawFrame(images[currentFrame], ctx);
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [images, frameCount, isMobile]);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && images.length > 0) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (isMobile) {
            drawFrame(images[0], ctx);
          } else {
            const container = containerRef.current;
            if (container) {
              const progress = Math.max(0, Math.min(1, -container.getBoundingClientRect().top / (container.getBoundingClientRect().height - window.innerHeight)));
              const frameIndex = Math.floor(progress * (frameCount - 1));
              if (images[frameIndex]?.complete) {
                drawFrame(images[frameIndex], ctx);
              }
            }
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, frameCount, isMobile]);

  return (
    <div ref={containerRef} className={clsx('relative w-full', className)}>
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-space-950 -z-10" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: loadedCount > 0 ? 0.4 : 0 }} // Keep opacity low so text is readable
        />
        <div className="absolute inset-0 bg-gradient-to-b from-space-950/80 via-transparent to-space-950/80" />
      </div>
      
      {/* Content wrapper */}
      <div className="absolute top-0 left-0 w-full h-full">
        {children}
      </div>
    </div>
  );
}
