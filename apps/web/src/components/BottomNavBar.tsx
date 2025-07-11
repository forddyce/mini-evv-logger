import React from "react";

interface BottomNavBarProps {
  activeTab: "home" | "profile";
  onTabChange: (tab: "home" | "profile") => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navItemClass = (tab: "home" | "profile") =>
    `flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
      activeTab === tab
        ? "text-blue-600 bg-blue-50"
        : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden z-20">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onTabChange("home")}
          className={navItemClass("home")}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            ></path>
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => onTabChange("profile")}
          className={navItemClass("profile")}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
