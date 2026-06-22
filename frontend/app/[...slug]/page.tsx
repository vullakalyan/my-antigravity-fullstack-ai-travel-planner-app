import { redirect } from 'next/navigation';

// This catch-all route redirects any unknown path to /not-found
// so the URL in the browser always shows http://localhost:3000/not-found
export default function CatchAllPage() {
  redirect('/not-found');
}
