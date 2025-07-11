import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNavBar from "../components/BottomNavBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const handleTabChange = (tab: "home" | "profile") => {
    setActiveTab(tab);
    console.log(`Navigating to: ${tab}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <Header />
      <main className="flex-grow p-4 md:p-6 pb-20 md:pb-6"> {children}</main>
      <Footer />
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default MainLayout;
