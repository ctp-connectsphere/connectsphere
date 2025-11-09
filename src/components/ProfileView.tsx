import { useState, type FormEvent } from "react";
import { useUser } from "../context/UserContext";
import type { User } from "../types";

interface ProfileViewProps {
  user: User;
  setUser: (user: User) => void;
}

export default function ProfileView({ user, setUser }: ProfileViewProps) {
  const [profileData, setProfileData] = useState<User>(user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, name: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, email: e.target.value });
  };

  const handlePreferencesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProfileData({ ...profileData, studyPreferences: e.target.value });
  };

  const toggleAvailability = (day: string) => {
    setProfileData((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
  };

  const removeCourse = (courseToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course !== courseToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Update the parent component's user state
      setUser(profileData);

      // Simulate API call (you can uncomment when backend is ready)
      /*
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      */

      setMessage("Profile updated successfully!");
      console.log("Profile updated:", profileData);
    } catch (error) {
      setMessage("Error updating profile. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Profile Settings
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {getInitials(profileData.name)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profileData.name}
              </h3>
              <p className="text-gray-600">{profileData.major}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={profileData.name}
                onChange={handleNameChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profileData.email}
                onChange={handleEmailChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Courses
              </label>
              <div className="flex flex-wrap gap-2">
                {profileData.courses.map((course) => (
                  <span
                    key={course}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => removeCourse(course)}
                      className="hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="px-3 py-1 border border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:bg-gray-50"
                >
                  + Add Course
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="grid grid-cols-3 gap-2">
                {days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAvailability(day)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      profileData.availability.includes(day)
                        ? "bg-indigo-500 border-indigo-500 text-white"
                        : "border-gray-300 hover:bg-indigo-50 hover:border-indigo-500"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="preferences"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Study Preferences
              </label>
              <textarea
                id="preferences"
                value={profileData.studyPreferences}
                onChange={handlePreferencesChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Tell us about your study style and preferences..."
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
