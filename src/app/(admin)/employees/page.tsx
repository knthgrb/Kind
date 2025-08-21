import React from "react";
import EmployeeCard from "./_components/EmployeeCard";
export default function Employees() {
  const employees = [
    {
      name: "Jarrel Steward",
      image: "/people/darrellSteward.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Ralph Edwards",
      image: "/people/ralphEdwards.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Esther Howard",
      image: "/people/estherHoward.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Theresa Webb",
      image: "/people/theresaWebb.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Devon Lane",
      image: "/people/devonLane.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Kristin Watson",
      image: "/people/kristinWatson.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Dianne Russell",
      image: "/people/dianneRussell.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Jane Cooper",
      image: "/people/janeCooper.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Jarrel Steward",
      image: "/people/darrellSteward.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Ralph Edwards",
      image: "/people/ralphEdwards.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Esther Howard",
      image: "/people/estherHoward.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
    {
      name: "Theresa Webb",
      image: "/people/theresaWebb.png",
      email: "abc@gmail.com",
      joiningDate: "2024-12-05",
      idDocument: "ID & Certificate",
    },
  ];

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-lg px-8 py-6 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {employees.map((emp, idx) => (
            <EmployeeCard
              key={idx}
              name={emp.name}
              email={emp.email}
              joiningDate={emp.joiningDate}
              idDocument={emp.idDocument}
              avatarSrc={emp.image}
              onApprove={() => console.log("Approved", emp.name)}
              onReject={() => console.log("Rejected", emp.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
