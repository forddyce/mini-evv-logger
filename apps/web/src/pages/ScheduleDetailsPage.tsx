import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useScheduleStore } from "../store/useScheduleStore";
import type { Task } from "../types/api";

const ScheduleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentScheduleDetail,
    loading,
    error,
    fetchScheduleById,
    updateTaskStatus,
    startVisit,
  } = useScheduleStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const isActionLoading = loading.action || loading.currentScheduleDetail;

  useEffect(() => {
    if (id) {
      fetchScheduleById(id);
    }
  }, [id, fetchScheduleById]);

  useEffect(() => {
    if (currentScheduleDetail) {
      setTasks(currentScheduleDetail.tasks || []);
    } else {
      setTasks([]);
    }
  }, [currentScheduleDetail]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!currentScheduleDetail) return;
    await updateTaskStatus(
      currentScheduleDetail.id,
      taskId,
      completed,
      "placeholder for reason"
    );
    if (id) {
      fetchScheduleById(id);
    }
  };

  const getCurrentLocation = (): Promise<{
    latitude: number;
    longitude: number;
    address: string;
  }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Geolocation successful:", position.coords);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: "Current Geolocation (Approximate)", // todo: reverse geocoding api to get address
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            resolve({
              latitude: -6.2088,
              longitude: 106.8456,
              address: "Fallback Location (Jakarta, Indonesia)",
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.warn("Geolocation is not supported by this browser.");
        resolve({
          latitude: -6.2088,
          longitude: 106.8456,
          address: "Fallback Location (Jakarta, Indonesia)",
        });
      }
    });
  };

  const handleClockIn = async () => {
    if (!currentScheduleDetail) return;

    const currentLocation = await getCurrentLocation();

    await startVisit(currentScheduleDetail.id, currentLocation);
    if (id) {
      fetchScheduleById(id);
    }
    navigate(`/clock-out/${currentScheduleDetail.id}`);
  };

  if (loading.currentScheduleDetail) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading schedule details...</p>
      </div>
    );
  }

  if (error.currentScheduleDetail) {
    return (
      <div
        className="container mx-auto px-4 py-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.currentScheduleDetail}</span>
        <p className="mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!currentScheduleDetail) {
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

  const schedule = currentScheduleDetail;

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
            {schedule.service_name}
          </h3>
          <div className="flex items-center mb-4">
            <img
              src={
                schedule.client_avatar ||
                "https://placehold.co/48x48/E0E7FF/4F46E5?text=NA"
              }
              alt={`${schedule.client_name} Avatar`}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full mr-4 border-2 border-indigo-300"
            />
            <span className="text-lg md:text-xl font-semibold text-gray-800">
              {schedule.client_name}
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
              <span>{schedule.shift_date}</span>
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
              <span>
                {schedule.start_time} - {schedule.end_time}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="mb-6">
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              Client Contact:
            </h4>
            <p className="text-gray-700 text-sm md:text-base">N/A</p>{" "}
            <p className="text-gray-700 text-sm md:text-base">N/A</p>{" "}
          </div>

          <div className="mb-6">
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              Address:
            </h4>
            <p className="text-gray-700 text-sm md:text-base">
              {schedule.location.address}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              ({schedule.location.latitude}, {schedule.location.longitude})
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
              Tasks:
            </h4>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No tasks for this schedule.
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 text-sm md:text-base"
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) =>
                          handleTaskCompletion(task.id, e.target.checked)
                        }
                        disabled={
                          isActionLoading || schedule.status !== "in_progress"
                        }
                        className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                      />
                      <span
                        className={`ml-3 ${task.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                      >
                        {task.description}
                      </span>
                    </label>
                    {task.reason && (
                      <span className="text-xs text-red-500 ml-4">
                        Reason: {task.reason}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
              Service Notes:
            </h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 text-sm md:text-base">
              <p>{schedule.service_notes}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          {schedule.status === "scheduled" && (
            <button
              onClick={handleClockIn}
              disabled={isActionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 md:px-8 rounded-lg shadow-md transition-colors duration-200 w-full md:w-auto"
            >
              {isActionLoading ? "Clocking In..." : "Clock In Now"}
            </button>
          )}
          {schedule.status === "in_progress" && (
            <button
              onClick={() => navigate(`/clock-out/${schedule.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 md:px-8 rounded-lg shadow-md transition-colors duration-200 w-full md:w-auto"
            >
              Continue Clock-Out
            </button>
          )}
          {schedule.status === "completed" && (
            <button
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 md:px-8 rounded-lg shadow-md transition-colors duration-200 w-full md:w-auto"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsPage;
