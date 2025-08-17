import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ title, onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 lg:pl-64">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="Menu" className="h-6 w-6" />
          </button>
          <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900 font-display">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ApperIcon name="Bell" className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">NG</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;