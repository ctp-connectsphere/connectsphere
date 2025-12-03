import { redirect } from 'next/navigation';

export default function HomePage() {
  // Default logged-in landing: Study Partner (matches) page
  redirect('/matches');
}
