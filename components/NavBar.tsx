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
    <nav className="flex items-center gap-2 rounded-xl bg-transparent p-2 shadow-2xl backdrop-blur-md absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
      {navItems.map((navItem) => (
        <button
          key={navItem}
          onClick={() => handleItemClick(navItem)}
          className={`
            rounded-lg px-4 py-2 text-sm font-medium
            transition-all duration-200
            ${
              selectedNavItem === navItem
                ? "bg-purple-600 text-black shadow-md shadow-purple-500/30"
                : "text-zinc-600 hover:bg-zinc-800 hover:text-white"
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