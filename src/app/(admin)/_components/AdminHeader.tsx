import Image from "next/image";
import Link from "next/link";
import { LuBell } from "react-icons/lu";
import { FaRegEnvelope } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";

export default function AdminHeader() {
  return (
    <header className="bg-white">
      <div className="w-full px-35 mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <Image src="/kindLogo.png" alt="Kind Logo" width={150} height={50} />
        </div>

        <nav className="flex space-x-10 text-lg font-medium items-center">
          <Link href="/dashboard" className="custom-link hover:text-red-600">
            Dashboard
          </Link>
          <Link href="/employees" className="custom-link hover:text-red-600">
            Employees
          </Link>
          <Link href="/payslip" className="custom-link hover:text-red-600">
            Payslip
          </Link>
          <Link
            href="/government-benefits"
            className="custom-link hover:text-red-600"
          >
            Gov't Benefits
          </Link>
          <Link
            href="/documents"
            className="custom-link hover:text-red-600 mr-15"
          >
            Documents
          </Link>
          <Link href="/messages">
            <FaRegEnvelope className="text-[#636363] hover:text-red-600 cursor-pointer" />
          </Link>

          <Link href="/notifications">
            <LuBell className="text-[#636363] hover:text-red-600 cursor-pointer" />
          </Link>

          <div className="flex items-center space-x-3 cursor-pointer">
            <Link href="/profile" className="w-10 aspect-square relative block">
              <Image
                src="/people/admin-profile.png"
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </Link>

            <span className="text-[#1a1a3b] font-medium">Andry Smith</span>
            <FaChevronDown className="text-[#1a1a3b] text-sm cursor-pointer" />
          </div>
        </nav>
      </div>
    </header>
  );
}
