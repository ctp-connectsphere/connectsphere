'use client';

import React from 'react';

interface CourseProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function Course({
  title,
  description
}: CourseProps){
  return(
    <div className="border border-gray-200 rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}