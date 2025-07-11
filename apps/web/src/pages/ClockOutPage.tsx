import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClockOutSuccessModal from "../components/ClockOutSuccessModal";

interface ActiveScheduleDetail {
  id: string;
  serviceName: string;
  clientName: string;
  clientAvatar: string;
  locationAddress: {
    street: string;
    cityStateZip: string;
  };
  timeRange: string;
  date: string;
  tasks: { id: string; description: string; completed: boolean }[];
  serviceNotes: string;
}

const ACTIVE_SCHEDULE_DETAILS: ActiveScheduleDetail = {
  id: "sch-003",
  serviceName: "Service Name C",
  clientName: "Jane Smith",
  clientAvatar: "https://placehold.co/48x48/E0E7FF/4F46E5?text=JS",
  locationAddress: {
    street: "456 Oak Ave",
    cityStateZip: "Othercity, NY, 10001",
  },
  timeRange: "13:00 - 14:00",
  date: "Mon, 15 Jan 2025",
  tasks: [
    {
      id: "task-1",
      description:
        "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      completed: false,
    },
    {
      id: "task-2",
      description:
        "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      completed: false,
    },
    {
      id: "task-3",
      description:
        "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      completed: false,
    },
    {
      id: "task-4",
      description:
        "Lorem ipsum dolor sit amet consectetur. Est id ullamcorper magna feugiat. Donec id at eu nibh sed lacus id. At mauris diam faucibus adipiscing feugiat dui lobortis.",
      completed: false,
    },
  ],
  serviceNotes:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fen tempus sociis. Sodales libero mauris eu donec tempor in sagittis urna turpis. Vitae vestibulum convallis consequat commodo blandit in fusce viverra. Semper magna amet ipsum massa turpis non tortor. Etiam diam quae tristique nulla. Ipsum duis praesent sed a mattis morbi aliquam. Enim quam amet cras nibh. Amet qui malesuada ac in ultrices. Viverra sagittis aenean vulputate at orci aliquam enim.",
};

const ClockOutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentVisit = ACTIVE_SCHEDULE_DETAILS;

  const [tasks, setTasks] = useState(currentVisit.tasks);
  const [addReason, setAddReason] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let durationString = "";
    if (hours > 0) {
      durationString += `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    if (minutes > 0) {
      if (hours > 0) durationString += " ";
      durationString += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    if (durationString === "") {
      return "less than a minute";
    }
    return durationString;
  };

  const handleTaskCompletion = (taskId: string, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: completed } : task
      )
    );
  };

  const handleClockOut = () => {
    console.log(`Clocking out from visit: ${currentVisit.id}`);
    console.log("Completed Tasks:", tasks);
    console.log("Additional Reason:", addReason);
    setShowSuccessModal(true);
  };

  const handleGoHomeFromModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  const handleCancelClockIn = () => {
    console.log(`Cancelling clock-in for visit: ${currentVisit.id}`);
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!currentVisit || currentVisit.id !== id) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <h2 className="text-3xl font-bold mb-4">
          Visit Not Active / Not Found
        </h2>
        <p>This visit is not currently in progress or could not be found.</p>
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
        Clock-Out
      </button>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-200">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {formatTime(elapsedTime)}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {currentVisit.serviceName}
          </h3>
          <div className="flex items-center mb-4">
            <img
              src={currentVisit.clientAvatar}
              alt={`${currentVisit.clientName} Avatar`}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full mr-4 border-2 border-indigo-300"
            />
            <span className="text-lg md:text-xl font-semibold text-gray-800">
              {currentVisit.clientName}
            </span>
          </div>
          <div className="flex items-center text-gray-600 text-sm space-x-4">
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
              <span>{currentVisit.timeRange}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
            Tasks:
          </h4>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 p-4 rounded-md border border-gray-100"
              >
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  {task.description}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleTaskCompletion(task.id, true)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm md:text-base ${
                      task.completed
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleTaskCompletion(task.id, false)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm md:text-base ${
                      !task.completed
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
            <button className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm md:text-base mt-2">
              <svg
                className="w-5 h-5 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add new task
            </button>
            <textarea
              placeholder="Add reason..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y text-sm md:text-base"
              rows={3}
              value={addReason}
              onChange={(e) => setAddReason(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
            Clock-in Location:
          </h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex items-center space-x-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 text-xs">
              Map Placeholder
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm md:text-base">
                {currentVisit.locationAddress.street}
              </p>
              <p className="text-sm text-gray-600">
                {currentVisit.locationAddress.cityStateZip}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
            Service Notes:
          </h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 text-sm md:text-base">
            <p>{currentVisit.serviceNotes}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleCancelClockIn}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 w-full sm:w-auto"
          >
            Cancel Clock-In
          </button>
          <button
            onClick={handleClockOut}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 w-full sm:w-auto"
          >
            Clock-Out
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <ClockOutSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onGoHome={handleGoHomeFromModal}
          date={currentVisit.date}
          timeRange={currentVisit.timeRange}
          duration={formatDuration(elapsedTime)}
        />
      )}
    </div>
  );
};

export default ClockOutPage;
