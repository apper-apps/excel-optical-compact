import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Learning Hub", href: "/learning", icon: "GraduationCap" },
    { name: "Tools", href: "/tools", icon: "Wrench" },
    { name: "Scripts", href: "/scripts", icon: "Code" },
    { name: "Community", href: "/community", icon: "Users" },
{ name: "Calendar", href: "/calendar", icon: "Calendar" },
{ name: "Wins", href: "/wins", icon: "Trophy" },
{ name: "Recommendations", href: "/recommendations", icon: "Lightbulb" },
{ name: "Your AI", href: "/your-ai", icon: "Bot" },
{ name: "Settings", href: "/settings", icon: "User" },
{ name: "Admin", href: "/admin", icon: "Settings" }
];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-r-2 border-primary"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`
      }
    >
      <ApperIcon name={item.icon} className="mr-3 h-5 w-5" />
      {item.name}
    </NavLink>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-6 bg-gradient-to-r from-primary to-blue-600">
          <ApperIcon name="Zap" className="h-8 w-8 text-white mr-3" />
          <span className="text-xl font-bold text-white font-display">PPC Hub</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AS</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Autoshop Solutions</p>
              <p className="text-xs text-gray-500">PPC Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative flex w-full max-w-xs flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary to-blue-600">
              <div className="flex items-center">
                <ApperIcon name="Zap" className="h-8 w-8 text-white mr-3" />
                <span className="text-xl font-bold text-white font-display">PPC Hub</span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <ApperIcon name="X" className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">AS</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Autoshop Solutions</p>
                  <p className="text-xs text-gray-500">PPC Team</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;