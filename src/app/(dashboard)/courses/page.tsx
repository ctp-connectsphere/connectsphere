import { Course, NewCourse } from '@/components/ui/course';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function CoursesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h1>
          <div className="bg-white shadow rounded-lg p-6">
            <NewCourse />
            <h2 className="text-xl font-bold mb-6">Current</h2>
            <Course title="Math" description="Mathy math stuff"/>
            <Course title="English" description="Words and more words"/>
            <Course title="History" description="Lots of dates"/>
            <Course title="Science" description="Definitions and more"/>
            <h2 className="text-xl font-bold mb-6 mt-8">Archived</h2>
            <Course title="Art" description="Colors and shapes"/>
            <Course title="Music" description="Sounds and rhythms"/>
          </div>
        </div>
      </div>
    </div>
  );
}
