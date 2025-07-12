import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center rounded-b-lg relative z-10">
      <div className="md:hidden text-xl font-bold text-gray-800">
        Welcome Louis!
      </div>

      <div className="hidden md:flex items-center">
        <img
          className={`${styles.logo} hover:cursor-pointer`}
          src="/assets/logo.png"
          onClick={() => {
            navigate("/");
          }}
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
        >
          <div className="relative">
            <img
              src="/assets/avatar.jpg"
              alt="Admin A Avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-gray-800">Admin A</span>
            <span className="text-xs text-gray-500">Admin@healthcare.io</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
