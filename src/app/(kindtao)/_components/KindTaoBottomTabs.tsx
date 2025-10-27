"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiSearch,
  FiMessageCircle,
  FiUser,
  FiMoreHorizontal,
} from "react-icons/fi";

export default function KindTaoBottomTabs() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/find-work")
      return pathname === href || pathname?.startsWith("/find-work/");
    if (href === "/chats")
      return pathname === href || pathname?.startsWith("/chats/");
    if (href === "/kindtao-more")
      return pathname === href || pathname?.startsWith("/kindtao-more/");
    if (href === "/dashboard")
      return pathname === href || pathname?.startsWith("/dashboard/");
    return pathname === href;
  };

  return (
    <ul className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white grid grid-cols-4 border-t border-gray-200">
      <li>
        <Link
          href="/find-work"
          className="flex flex-col items-center justify-center py-2 text-xs"
        >
          <FiMessageCircle
            className={`h-5 w-5 ${
              isActive("/find-work") ? "text-red-600" : "text-gray-500"
            }`}
          />
          <span
            className={`${
              isActive("/find-work") ? "text-red-600" : "text-gray-600"
            }`}
          >
            Find Work
          </span>
        </Link>
      </li>
      <li>
        <Link
          href="/chats"
          className="flex flex-col items-center justify-center py-2 text-xs"
        >
          <FiMessageCircle
            className={`h-5 w-5 ${
              isActive("/chats") ? "text-red-600" : "text-gray-500"
            }`}
          />
          <span
            className={`${
              isActive("/chats") ? "text-red-600" : "text-gray-600"
            }`}
          >
            Messages
          </span>
        </Link>
      </li>
      <li>
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center py-2 text-xs"
        >
          <FiMessageCircle
            className={`h-5 w-5 ${
              isActive("/profile") ? "text-red-600" : "text-gray-500"
            }`}
          />
          <span
            className={`${
              isActive("/profile") ? "text-red-600" : "text-gray-600"
            }`}
          >
            Profile
          </span>
        </Link>
      </li>
      <li>
        <Link
          href="/kindtao-more"
          className="flex flex-col items-center justify-center py-2 text-xs"
        >
          <FiMoreHorizontal
            className={`h-5 w-5 ${
              isActive("/kindtao-more") ? "text-red-600" : "text-gray-500"
            }`}
          />
          <span
            className={`${
              isActive("/kindtao-more") ? "text-red-600" : "text-gray-600"
            }`}
          >
            More
          </span>
        </Link>
      </li>
    </ul>
  );
}
