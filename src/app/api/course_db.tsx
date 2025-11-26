'use server';

import { prisma } from '@/lib/db/connection';

export async function findCourse(uuid: string) {
  const course = await prisma.course.findUnique({
    where: { id: uuid },
  });

  return course ? course : "Course not found";
}

export async function lookupCourses(searchTerm: string) {
  const courses = await prisma.course.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
  });

  return courses;
}