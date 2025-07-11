import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-4 px-6 text-center text-sm text-gray-500 shadow-t-sm rounded-t-lg">
      &copy;{new Date().getFullYear()} Careviah, Inc. All rights reserved.
    </footer>
  );
};

export default Footer;
