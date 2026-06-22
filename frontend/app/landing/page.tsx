import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'AI Travel Planner | Intelligent Itinerary Generation',
  description: 'Experience the future of travel planning with our premium AI engine. Instant, personalized itineraries with accurate budgets and curated stays.',
};

export default function LandingPage() {
  return <LandingPageClient />;
}
