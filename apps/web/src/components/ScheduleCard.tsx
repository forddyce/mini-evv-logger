import React from "react";

interface ScheduleCardProps {
  id: string;
  status: "Scheduled" | "In progress" | "Completed" | "Cancelled";
  clientName: string;
  serviceName: string;
  location: string;
  date: string;
  timeRange: string;
  isActive: boolean;
  isAnyActive: boolean;
  onClockIn: (
    scheduleId: string,
    clientName: string,
    location: string,
    timeRange: string
  ) => void;
  onClockOut: (scheduleId: string) => void;
  onViewDetails: (scheduleId: string) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  id,
  status,
  clientName,
  serviceName,
  location,
  date,
  timeRange,
  isAnyActive,
  onClockIn,
  onClockOut,
  onViewDetails,
}) => {
  let statusColorClass = "";
  let statusBgClass = "";
  let button1Text = "";
  let button2Text = "";
  let button1ColorClass = "";
  let button2ColorClass = "";
  let clockInDisabled = false;

  switch (status) {
    case "Scheduled":
      statusColorClass = "text-blue-600";
      statusBgClass = "bg-blue-100";
      button1Text = "Clock In Now";
      button1ColorClass = "bg-emerald-600 hover:bg-emerald-700 text-white";
      clockInDisabled = isAnyActive;
      break;
    case "In progress":
      statusColorClass = "text-orange-600";
      statusBgClass = "bg-orange-100";
      button1Text = "View Progress";
      button1ColorClass = "bg-gray-200 hover:bg-gray-300 text-gray-800";
      button2Text = "Clock Out Now";
      button2ColorClass = "bg-emerald-600 hover:bg-emerald-700 text-white";
      break;
    case "Completed":
      statusColorClass = "text-green-600";
      statusBgClass = "bg-green-100";
      button1Text = "View Report";
      button1ColorClass = "bg-gray-200 hover:bg-gray-300 text-gray-800";
      break;
    case "Cancelled":
      statusColorClass = "text-red-600";
      statusBgClass = "bg-red-100";
      break;
    default:
      break;
  }

  const handleButton1Click = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "Scheduled") {
      onClockIn(id, clientName, location, timeRange);
    } else if (status === "In progress" || status === "Completed") {
      console.log(`${button1Text} clicked for ${clientName}`);
      onViewDetails(id);
    }
  };

  const handleButton2Click = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === "In progress") {
      onClockOut(id);
    }
  };

  const handleCardClick = () => {
    if (
      status === "Scheduled" ||
      status === "In progress" ||
      status === "Completed"
    ) {
      onViewDetails(id);
    }
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 ${
        status === "Scheduled" ||
        status === "In progress" ||
        status === "Completed"
          ? "cursor-pointer hover:shadow-lg transition-shadow duration-200"
          : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${statusBgClass} ${statusColorClass}`}
        >
          {status}
        </span>
        <button className="text-gray-500 hover:text-gray-700">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01"
            ></path>
          </svg>
        </button>
      </div>

      <div className="flex items-center mb-2">
        <img
          src="https://placehold.co/48x48/E0E7FF/4F46E5?text=MA"
          alt={`${clientName} Avatar`}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
          <p className="text-sm text-gray-600">{serviceName}</p>
        </div>
      </div>

      <div className="flex items-center text-gray-600 text-sm mb-4">
        <svg
          className="w-4 h-4 mr-2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        <span>{location}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-700 items-center border-t border-b border-gray-200 py-3 mb-4">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span>{date}</span>
        </div>
        <div className="text-center">
          <span className="text-xl font-bold text-gray-400">|</span>
        </div>
        <div className="flex items-center justify-end">
          <svg
            className="w-4 h-4 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{timeRange}</span>
        </div>
      </div>

      {(status === "Scheduled" ||
        status === "In progress" ||
        status === "Completed") && (
        <div className="flex space-x-4">
          {button1Text && (
            <button
              onClick={handleButton1Click}
              disabled={status === "Scheduled" && clockInDisabled}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${button1ColorClass} ${status === "Scheduled" && clockInDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {button1Text}
            </button>
          )}
          {button2Text && (
            <button
              onClick={handleButton2Click}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${button2ColorClass}`}
            >
              {button2Text}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
