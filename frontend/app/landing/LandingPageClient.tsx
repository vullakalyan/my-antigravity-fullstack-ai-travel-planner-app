'use client';

import { ArrowRight, Globe, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CanvasSequence from '@/components/CanvasSequence';

export default function LandingPageClient() {
  return (
    <main className="min-h-screen bg-space-950 text-white selection:bg-cyan-400/30">
      <Navbar />

      {/* 
        Scroll-driven cinematic experience using 208 frames.
        On mobile, degrades to static image + standard scroll.
        The wrapper is 500vh tall to allow scrolling through 5 sections.
      */}
      <CanvasSequence
        frameCount={208}
        framePrefix="/sequence/ezgif-frame-"
        padLength={3}
        className="h-[500vh]"
      >
        {/* Section 1: Hero (AI Core) */}
        <section className="h-screen flex flex-col items-center justify-center relative px-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-transparent to-transparent opacity-80" />
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 mb-8 backdrop-blur animate-fade-in-up">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">Powered by Claude 3.5 Sonnet</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Travel Planning, <br className="hidden md:block" />
              <span className="gradient-text">Reimagined</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Experience the future of travel. Our intelligent engine analyzes millions of data points to generate perfect, personalized itineraries in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/register" className="btn-primary px-8 py-4 text-base w-full sm:w-auto">
                Start Planning Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <a href="#how-it-works" className="btn-secondary px-8 py-4 text-base w-full sm:w-auto bg-space-950/50 backdrop-blur">
                Explore the Engine
              </a>
            </div>
          </div>
          
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-60">
            <span className="text-xs tracking-widest uppercase text-cyan-400">Scroll to Explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-cyan-400 to-transparent" />
          </div>
        </section>

        {/* Section 2: Travel Data Assembling */}
        <section id="how-it-works" className="h-screen flex items-center relative px-4 sm:px-12 lg:px-24">
          <div className="max-w-2xl">
            <div className="glass-card-cyan p-8 md:p-12 transform transition-transform hover:scale-[1.02]">
              <div className="h-12 w-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Global Data Integration</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                We synthesize real-time data across destinations, pricing, and availability. By mapping millions of geographical data points, our AI understands context better than any human agent.
              </p>
              <ul className="space-y-4">
                {['Real-time flight & hotel pricing', 'Hyper-local activity mapping', 'Seasonal weather intelligence'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-cyan-glow" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Intelligent Planning Engine */}
        <section id="features" className="h-screen flex items-center justify-end relative px-4 sm:px-12 lg:px-24">
          <div className="max-w-2xl w-full text-right flex flex-col items-end">
            <div className="glass-card p-8 md:p-12 transform transition-transform hover:scale-[1.02] bg-space-950/60 backdrop-blur-md border-gold-400/20">
              <div className="h-12 w-12 rounded-2xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mb-6 ml-auto">
                <Zap className="h-6 w-6 text-gold-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-glow-gold">Cognitive Architecture</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Powered by state-of-the-art LLMs, the engine evaluates your specific constraints—budget, duration, and interests—to architect a mathematically optimal and experientially rich journey.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-gold-400 font-display text-2xl font-bold">10x</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Faster Planning</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-gold-400 font-display text-2xl font-bold">100%</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Personalized</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Global Travel Visualization */}
        <section className="h-screen flex items-center relative px-4 sm:px-12 lg:px-24">
          <div className="max-w-2xl">
            <div className="glass-card-cyan p-8 md:p-12 transform transition-transform hover:scale-[1.02]">
              <div className="h-12 w-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Enterprise Grade Security</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Your travel plans and personal data are secured using military-grade encryption. We employ strict data boundaries ensuring your itineraries remain entirely private.
              </p>
              <Link href="/register" className="inline-flex items-center text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                Read our Security Promise
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 5: Premium Dashboard Reveal (CTA) */}
        <section className="h-screen flex flex-col items-center justify-center relative px-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/80 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Ready to Command Your Journey?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Join thousands of travelers who have already upgraded their planning experience. 
              The dashboard awaits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary px-10 py-5 text-lg w-full sm:w-auto shadow-cyan-lg">
                Deploy Dashboard
              </Link>
              <Link href="/login" className="text-slate-400 hover:text-white font-medium transition-colors">
                Sign in to existing account
              </Link>
            </div>
          </div>
        </section>
      </CanvasSequence>

      {/* Footer */}
      <footer className="bg-space-950 py-8 border-t border-white/10 text-center relative z-20">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} AI Travel Planner. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
