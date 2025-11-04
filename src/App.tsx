import { useState } from "react";
import Navigation from "./components/Navigation";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import MatchesView from "./components/MatchesView";
import GroupsView from "./components/GroupsView";
import ProfileView from "./components/ProfileView";
import type { Match, Group } from "./types";

function App() {
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Sample data
  const matches: Match[] = [
    {
      id: 1,
      name: "Sarah Chen",
      course: "Computer Science 101",
      match: 95,
      avatar: "SC",
      available: "Mon, Wed, Fri",
    },
    {
      id: 2,
      name: "James Wilson",
      course: "Data Structures",
      match: 89,
      avatar: "JW",
      available: "Tue, Thu",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      course: "Computer Science 101",
      match: 87,
      avatar: "ER",
      available: "Mon, Wed",
    },
  ];

  const groups: Group[] = [
    {
      id: 1,
      name: "CS101 Study Squad",
      members: 4,
      course: "Computer Science 101",
      nextMeeting: "Oct 10, 2025",
    },
    {
      id: 2,
      name: "Data Structures Masters",
      members: 3,
      course: "Data Structures",
      nextMeeting: "Oct 12, 2025",
    },
  ];

  if (!isLoggedIn) {
    return <LoginView setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        setIsLoggedIn={setIsLoggedIn}
      />
      {currentView === "dashboard" && (
        <DashboardView matches={matches} groups={groups} />
      )}
      {currentView === "matches" && <MatchesView matches={matches} />}
      {currentView === "groups" && <GroupsView groups={groups} />}
      {currentView === "profile" && <ProfileView />}
    </div>
  );
}

export default App;
