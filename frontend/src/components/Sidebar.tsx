"use client";

import React, { useEffect, useState } from "react";
import { BsArrowLeftShort, BsKanbanFill } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { FaUser, FaUsers } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  const [open, setOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showText, setShowText] = useState(open);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 480) {
        setIsMobile(true);
        setOpen(false);
      } else {
        setIsMobile(false);
        const saved = localStorage.getItem("isOpenSidebar");
        setOpen(saved !== null ? JSON.parse(saved) : true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    setIsReady(true);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setShowText(true), 200);
      return () => clearTimeout(timeout);
    } else {
      setShowText(false);
    }
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => {
      if (!isMobile)
        localStorage.setItem("isOpenSidebar", JSON.stringify(!prev));
      return !prev;
    });
  };

  if (!isReady) return null;

  const Menus = [
    {
      title: "Профиль",
      icon: <FaUser />,
      spacing: true,
      hover: "hover:bg-hover",
      isHighLight: router.pathname === "/profile",
      link: "/profile",
    },
    {
      title: "Уведомления",
      icon: <IoMdNotifications />,
      hover: "hover:bg-hover",
      isHighLight: router.pathname === "/notifications",
      link: "/notifications",
    },
    {
      title: "Мои доски",
      icon: <BsKanbanFill />,
      spacing: true,
      hover: "hover:bg-hover",
      isHighLight: router.pathname === "/main",
      link: "/main",
    },
    {
      title: "Доступные доски",
      icon: <FaUsers />,
      hover: "hover:bg-hover",
      isHighLight: router.pathname === "/in_boards",
      link: "/in_boards",
    },
    {
      title: "Выход",
      icon: <AiOutlineLogout />,
      spacing: true,
      hover: "hover:bg-red-400 hover:text-white",
    },
  ];

  const MobileArrowButton = (
    <button
      className="fixed top-4 left-4 z-50 bg-white rounded-full border border-sidebar-bg p-2 shadow-lg transition-all duration-300"
      onClick={handleToggle}
      aria-label={open ? "Закрыть меню" : "Открыть меню"}
      style={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BsArrowLeftShort
        className={` text-sidebar-bg rounded-full text-3xl transition-all duration-300 ${
          open ? "" : "rotate-180"
        }`}
      />
    </button>
  );

  return (
    <>
      {isMobile && MobileArrowButton}
      <div
        className={`
        ${
          isMobile
            ? `fixed top-0 left-0 w-screen h-screen bg-sidebar-bg z-40 flex flex-col p-5 pt-8 transition-all duration-300 ${
                open
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`
            : `bg-sidebar-bg h-screen ${open && "mr-0"} p-5 pt-8 ${
                open ? "w-66" : "w-20"
              } relative transition-all duration-300 z-10`
        }
        `}
        style={isMobile ? { minWidth: 0, maxWidth: "100vw" } : {}}
      >
        {!isMobile && (
          <BsArrowLeftShort
            className={`bg-white border border-sidebar-bg text-sidebar-bg text-3xl rounded-full absolute -right-3.5 top-9 cursor-pointer ${
              !open && "rotate-180"
            }`}
            onClick={handleToggle}
          />
        )}

        <div className="flex flex-col gap-4 items-center justify-center mt-8 mb-2">
          <Image
            className="rounded float-left duration-500"
            src={"/favicon.ico"}
            height={80}
            width={80}
            alt="logo"
          />
          <h1
            className={`${
              !open && "scale-0"
            } text-text-inverted origin-left font-medium text-2xl duration-300`}
          >
            Tralalelo
          </h1>
        </div>

        <ul className="pt-2">
          {Menus.map((menu, index) => (
            <Link
              href={`${menu.link}`}
              key={index}
              onClick={() => {
                if (isMobile) setOpen(false);
              }}
            >
              <li
                className={`text-text-inverted flex items-center gap-x-4 cursor-pointer p-2  rounded-md ${
                  menu.spacing ? "mt-7" : "mt-2"
                } ${menu.hover ? menu.hover : "hover:bg-hover"} ${menu.isHighLight && "bg-hover!"}`}
              >
                <span className="text-2xl block float-left">{menu.icon} </span>
                <span
                  className={`duration-200 text-base whitespace-nowrap font-medium flex-1 transition-all ${
                    open && showText
                      ? "opacity-100 max-w-[200px] ml-0"
                      : "opacity-0 max-w-0 ml-[-8px] pointer-events-none"
                  }`}
                  style={{
                    transitionProperty: "opacity,max-width,margin",
                  }}
                >
                  {showText && menu.title}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </>
  );
}
