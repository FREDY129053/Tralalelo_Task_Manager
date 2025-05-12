import React, { useState } from "react";
import {
  BsArrowLeftShort,
  BsChevronDown,
  BsFillImageFill,
  BsPerson,
  BsReverseLayoutTextSidebarReverse,
  BsSearch,
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
  const [open, setOpen] = useState<boolean>(false);
  const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);

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
      className={`bg-dark-purple h-screen p-5 pt-8 ${
        open ? "w-66" : "w-20"
      } relative duration-300`}
    >
      <BsArrowLeftShort
        className={`bg-white border border-dark-purple text-dark-purple text-3xl rounded-full absolute -right-3.5 top-9 cursor-pointer ${
          !open && "rotate-180"
        }`}
        onClick={() => setOpen(!open)}
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
          } text-white origin-left font-medium text-2xl duration-300`}
        >
          Tralalelo
        </h1>
      </div>

      <div
        className={`flex items-center rounded-md bg-light-white mt-6 py-2 ${
          !open ? "px-2.5" : "px-4"
        } duration-300`}
      >
        <BsSearch
          className={`text-white text-lg block float-left cursor-pointer ${
            open && "mr-2"
          } `}
        />
        <input
          className={`text-base bg-transparent w-full text-white focus:outline-none ${
            !open && "hidden"
          }`}
          type="search"
          name="search"
          placeholder="Search"
        />
      </div>

      <ul className="pt-2">
        {Menus.map((menu, index) => (
          <React.Fragment key={index}>
            <li
              // key={index}
              className={`text-gray-300 flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md ${
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
                    className="text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 rounded-md hover:bg-light-white"
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
