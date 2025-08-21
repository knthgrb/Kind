type StatCardProps = {
  label: string;
  value?: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="p-5 flex flex-col justify-between">
      <div className="text-[1.034rem] text-[#000000] font-medium">{label}</div>
      {value !== undefined && (
        <div className="text-[2.987rem] text-[#000000] font-bold text-center pt-3 pb-6">
          {value}
        </div>
      )}
    </div>
  );
}
