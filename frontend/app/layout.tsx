import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI Travel Planner — Intelligent Itinerary Generation',
    template: '%s | AI Travel Planner',
  },
  description:
    'Plan your perfect trip with AI. Generate detailed day-by-day itineraries, budget breakdowns, and hotel recommendations powered by Claude AI.',
  keywords: ['travel planner', 'AI travel', 'itinerary generator', 'trip planning', 'Claude AI'],
  authors: [{ name: 'AI Travel Planner' }],
  openGraph: {
    type: 'website',
    title: 'AI Travel Planner',
    description: 'Generate stunning AI-powered travel itineraries in seconds.',
    siteName: 'AI Travel Planner',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-space-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
