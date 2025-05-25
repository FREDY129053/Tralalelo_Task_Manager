'use client';

import React, { useState } from "react";
import {
  BsArrowLeftShort,
  BsChevronDown,
  BsFillImageFill,
  BsPerson,
  BsReverseLayoutTextSidebarReverse,
  // BsSearch,
} from "react-icons/bs";
import {
  AiFillEnvironment,
  // AiOutlineBarChart,
  AiOutlineFileText,
  AiOutlineLogout,
  // AiOutlineMail,
  AiOutlineSetting,
} from "react-icons/ai";
import { RiDashboardFill } from "react-icons/ri";

export default function Sidebar() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isOpenSidebar")
      return saved ? JSON.parse(saved) : false
    }
    return false
  });
  const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);

  const handleToggle = () => {
    setOpen((prev) => {
      localStorage.setItem("isOpenSidebar", JSON.stringify(!prev))
      return !prev;
    })
  }

  const Menus = [
    { title: "Dashboard", icon: <RiDashboardFill /> },
    { title: "Pages", icon: <AiOutlineFileText /> },
    { title: "Media", spacing: true, icon: <BsFillImageFill /> },
    {
      title: "Projects",
      icon: <BsReverseLayoutTextSidebarReverse />,
      submenu: true,
      submenuItems: [
        { title: "Submenu 1" },
        { title: "Submenu 2" },
        { title: "Submenu 3" },
      ],
    },
    // { title: "Analytics", icon: <AiOutlineBarChart /> },
    // { title: "Inbox", icon: <AiOutlineMail /> },
    { title: "Profile", icon: <BsPerson />, spacing: true },
    { title: "Setting", icon: <AiOutlineSetting /> },
    { title: "Logout", icon: <AiOutlineLogout /> },
  ];

  return (
    <div
      className={`bg-sidebar-bg h-screen p-5 pt-8 ${
        open ? "w-66" : "w-20"
      } relative duration-300`}
    >
      <BsArrowLeftShort
        className={`bg-white border border-sidebar-bg text-sidebar-bg text-3xl rounded-full absolute -right-3.5 top-9 cursor-pointer ${
          !open && "rotate-180"
        }`}
        onClick={(e) => handleToggle()}
      />

      <div className="inline-flex">
        <AiFillEnvironment
          className={`bg-amber-300 text-4xl rounded cursor-pointer block float-left mr-2 duration-500 ${
            !open && "rotate-360"
          }`}
        />
        <h1
          className={`${
            !open && "scale-0"
          } text-sidebar-text origin-left font-medium text-2xl duration-300`}
        >
          Tralalelo
        </h1>
      </div>

      <ul className="pt-2">
        {Menus.map((menu, index) => (
          <React.Fragment key={index}>
            <li
              // key={index}
              className={`text-sidebar-text flex items-center gap-x-4 cursor-pointer p-2 hover:bg-sidebar-hover rounded-md ${
                menu.spacing ? "mt-7" : "mt-2"
              }`}
              onClick={
                menu.submenu ? () => setSubmenuOpen(!submenuOpen) : () => {}
              }
            >
              <span className="text-2xl block float-left">{menu.icon} </span>
              <span
                className={`duration-300 text-base font-medium flex-1 ${
                  !open && "hidden"
                }`}
              >
                {menu.title}
              </span>
              {menu.submenu && open && (
                <BsChevronDown
                  className={`duration-300 ${submenuOpen && "rotate-180"}`}
                />
              )}
            </li>

            {menu.submenu && submenuOpen && open && (
              <ul>
                {menu.submenuItems.map((submenuItem, subIndex) => (
                  <li
                    key={subIndex}
                    className="text-sidebar-text text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 rounded-md hover:bg-sidebar-hover"
                  >
                    {submenuItem.title}
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}
