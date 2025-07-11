import React from "react";
import { useParams, useNavigate } from "react-router-dom";

interface ScheduleDetail {
  id: string;
  serviceName: string;
  clientName: string;
  clientAvatar: string;
  date: string;
  timeRange: string;
  clientContactEmail: string;
  clientContactPhone: string;
  address: {
    street: string;
    cityStateZip: string;
  };
  tasks: string[];
  serviceNotes: string;
}

const ALL_SCHEDULES_DETAILS: ScheduleDetail[] = [
  {
    id: "sch-001",
    serviceName: "Service Name A",
    clientName: "Melisa Adam",
    clientAvatar: "https://placehold.co/48x48/E0E7FF/4F46E5?text=MA",
    date: "Mon, 15 Jan 2025",
    timeRange: "09:00 - 10:00",
    clientContactEmail: "melisa@gmail.com",
    clientContactPhone: "+44 1232 212 323",
    address: {
      street: "4333 Wilson Street",
      cityStateZip: "Minneapolis, MN, 55415",
    },
    tasks: [
      "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
    ],
    serviceNotes:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fen tempus sociis. Sodales libero mauris eu donec tempor in sagittis urna turpis. Vitae vestibulum convallis consequat commodo blandit in fusce viverra. Semper magna amet ipsum massa turpis non tortor. Etiam diam quae tristique nulla. Ipsum duis praesent sed a mattis morbi aliquam. Enim quam amet cras nibh. Amet qui malesuada ac in ultrices. Viverra sagittis aenean vulputate at orci aliquam enim.",
  },
  {
    id: "sch-002",
    serviceName: "Service Name B",
    clientName: "John Doe",
    clientAvatar: "https://placehold.co/48x48/E0E7FF/4F46E5?text=JD",
    date: "Mon, 15 Jan 2025",
    timeRange: "11:00 - 12:00",
    clientContactEmail: "john.doe@example.com",
    address: {
      street: "123 Main St",
      cityStateZip: "Anytown, CA, 90210",
    },
    tasks: ["Task 1 for John", "Task 2 for John"],
    serviceNotes: "Notes for John Doe visit.",
    clientContactPhone: "+1 555 123 4567",
  },
  {
    id: "sch-003",
    serviceName: "Service Name C",
    clientName: "Jane Smith",
    clientAvatar: "https://placehold.co/48x48/E0E7FF/4F46E5?text=JS",
    date: "Mon, 15 Jan 2025",
    timeRange: "13:00 - 14:00",
    clientContactEmail: "jane.smith@example.com",
    address: {
      street: "456 Oak Ave",
      cityStateZip: "Othercity, NY, 10001",
    },
    tasks: ["Task A for Jane", "Task B for Jane", "Task C for Jane"],
    serviceNotes: "Notes for Jane Smith visit.",
    clientContactPhone: "+1 555 987 6543",
  },
];

const ScheduleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const sampleSchedule = ALL_SCHEDULES_DETAILS.find((s) => s.id === id);

  const handleClockIn = () => {
    if (sampleSchedule) {
      console.log(`Clocking in to visit: ${sampleSchedule.id}`);
      navigate("/");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!sampleSchedule) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <h2 className="text-3xl font-bold mb-4">Schedule Not Found</h2>
        <p>The schedule with ID "{id}" could not be found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-700 hover:text-gray-900 mb-6 text-lg font-semibold"
      >
        <svg
          className="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Schedule Details
      </button>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-200">
        <div className="flex flex-col items-center text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {sampleSchedule.serviceName}
          </h3>
          <div className="flex items-center mb-4">
            <img
              src={sampleSchedule.clientAvatar}
              alt={`${sampleSchedule.clientName} Avatar`}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full mr-4 border-2 border-indigo-300"
            />
            <span className="text-lg md:text-xl font-semibold text-gray-800">
              {sampleSchedule.clientName}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center text-gray-600 text-sm space-y-2 sm:space-y-0 sm:space-x-4">
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
              <span>{sampleSchedule.date}</span>
            </div>
            <span className="hidden sm:inline-block text-xl font-bold text-gray-400">
              |
            </span>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{sampleSchedule.timeRange}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="mb-6">
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              Client Contact:
            </h4>
            <p className="text-gray-700 text-sm md:text-base">
              {sampleSchedule.clientContactEmail}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              {sampleSchedule.clientContactPhone}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              Address:
            </h4>
            <p className="text-gray-700 text-sm md:text-base">
              {sampleSchedule.address.street}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              {sampleSchedule.address.cityStateZip}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
              Tasks:
            </h4>
            <div className="space-y-3">
              {sampleSchedule.tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 text-sm md:text-base"
                >
                  <span className="font-semibold">Activity Name A</span>
                  <p className="mt-1">{task}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
              Service Notes:
            </h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 text-sm md:text-base">
              <p>{sampleSchedule.serviceNotes}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleClockIn}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 md:px-8 rounded-lg shadow-md transition-colors duration-200 w-full md:w-auto"
          >
            Clock In Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsPage;
