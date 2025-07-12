import React from "react";

interface DashboardCardProps {
  count: number;
  title: string;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  count,
  title,
  colorClass,
}) => {
  return (
    <div className="bg-white p-6 rounded-[16px] border border-gray-200 text-center">
      <p className={`text-5xl font-bold mb-2 ${colorClass}`}>{count}</p>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    </div>
  );
};

export default DashboardCard;
