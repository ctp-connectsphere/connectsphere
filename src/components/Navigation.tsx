import { Users, Home, Search, User, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export default function Navigation({
  currentView,
  setCurrentView,
  setIsLoggedIn,
}: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ConnectSphere</span>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentView === "dashboard"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView("matches")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentView === "matches"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Find Matches</span>
          </button>
          <button
            onClick={() => setCurrentView("groups")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentView === "groups"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">My Groups</span>
          </button>
          <button
            onClick={() => setCurrentView("profile")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentView === "profile"
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
        </div>

        <button
          onClick={() => setIsLoggedIn(false)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
