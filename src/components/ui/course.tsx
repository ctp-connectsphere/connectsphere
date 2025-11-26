'use client';

import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { lookupCourses } from '../../app/api/course_db';

interface CourseProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  uuid: string;
}

export function Course({
  title, description
}: CourseProps){

  return(
    <div className="border border-gray-200 rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}

export function NewCourse() {
  const [showForm, setShowForm] = useState(false);

  const createCourse = (data: { title: string; description?: string }) => {
    // Logic to create a new course
    console.log('Create course logic goes here', data);
    setShowForm(false);
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    createCourse({ title });
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't lookup unless more than 3 characters to avoid unnecessary load
    console.log(e.target.value.length > 3 ? lookupCourses(e.target.value) : []);
  }

  return (
    <>
      <Button variant="primary" size="medium" className="mb-6" onClick={() => setShowForm(true)}>
        New Course
      </Button>
      { showForm && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full">
          <h2 className="text-xl font-bold mb-4">Add Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="courseTitle">
                Course Title
              </label>
              <input type="text" name="title" id="courseTitle" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter course title"/>
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
              Submit
            </button>
            <button className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      </div>)}
    </>
  );
}