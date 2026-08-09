"use client";

import React from "react";

const NavBar = ({
  setSelectedNavItem,
  selectedNavItem,
}: {
  setSelectedNavItem: React.Dispatch<React.SetStateAction<string | null>>;
  selectedNavItem: string | null;
}) => {
  const navItems = ["Reactions", "ASCII CAM", "Pixel Cam", "Glitch"];

  const handleItemClick = (item: string) => {
    setSelectedNavItem(item);
  };

  return (
    <nav className="flex items-center gap-2 rounded-xl bg-zinc-900/90 p-2 shadow-lg backdrop-blur-md">
      {navItems.map((navItem) => (
        <button
          key={navItem}
          onClick={() => handleItemClick(navItem)}
          className={`
            rounded-lg px-4 py-2 text-sm font-medium
            transition-all duration-200
            ${
              selectedNavItem === navItem
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }
          `}
        >
          {navItem}
        </button>
      ))}
    </nav>
  );
};

export default NavBar;