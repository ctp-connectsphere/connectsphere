export interface Match {
  id: number;
  name: string;
  course: string;
  match: number;
  avatar: string;
  available: string;
}

export interface Group {
  id: number;
  name: string;
  members: number;
  course: string;
  nextMeeting: string;
}

export interface User {
  name: string;
  email: string;
  major: string;
  courses: string[];
  availability: string[];
  studyPreferences: string;
}
