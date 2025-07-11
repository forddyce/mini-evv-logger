import React, { useState, useEffect } from "react";

interface ActiveVisitCardProps {
  clientName: string;
  location: string;
  timeRange: string;
  onClockOut: () => void;
}

const ActiveVisitCard: React.FC<ActiveVisitCardProps> = ({
  clientName,
  location,
  timeRange,
  onClockOut,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };

  return (
    <div className="bg-emerald-600 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center mb-8">
      <div className="flex items-center mb-4 md:mb-0">
        <img
          src="https://placehold.co/48x48/E0E7FF/4F46E5?text=MA"
          alt={`${clientName} Avatar`}
          className="w-12 h-12 rounded-full mr-4 border-2 border-white"
        />
        <div>
          <h3 className="text-xl font-bold">{clientName}</h3>
          <p className="text-sm opacity-90">{location}</p>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 md:mb-0">
        <span className="text-4xl font-bold mb-1">
          {formatTime(elapsedTime)}
        </span>
        <span className="text-sm opacity-90">{timeRange} SGT</span>
      </div>

      <button
        onClick={onClockOut}
        className="bg-white text-emerald-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
      >
        Clock Out
      </button>
    </div>
  );
};

export default ActiveVisitCard;
