import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClockOutSuccessModal from "../components/ClockOutSuccessModal";
import { useScheduleStore } from "../store/useScheduleStore"; // Import Zustand store
import type { Schedule, Task } from "../types/api"; // Import types

const ClockOutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get schedule ID from URL
  const navigate = useNavigate();

  const {
    currentScheduleDetail, // The schedule fetched for details page, should be 'in_progress' here
    loading,
    error,
    fetchScheduleById, // To fetch the schedule
    updateTaskStatus,
    endVisit, // To clock out
  } = useScheduleStore();

  const [currentVisit, setCurrentVisit] = useState<Schedule | null>(null); // State to hold the active visit data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addReason, setAddReason] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Time in seconds
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const isActionLoading = loading.action || loading.currentScheduleDetail;

  useEffect(() => {
    if (id) {
      fetchScheduleById(id); // Fetch the specific schedule
    }
  }, [id, fetchScheduleById]);

  useEffect(() => {
    if (
      currentScheduleDetail &&
      currentScheduleDetail.id === id &&
      currentScheduleDetail.status === "in_progress"
    ) {
      setCurrentVisit(currentScheduleDetail);
      setTasks(currentScheduleDetail.tasks || []);

      // Initialize timer if visitStart is available
      if (currentScheduleDetail.visit_start) {
        const visitStartTime = new Date(
          currentScheduleDetail.visit_start
        ).getTime();
        const timer = setInterval(() => {
          setElapsedTime(Math.floor((Date.now() - visitStartTime) / 1000));
        }, 1000);
        return () => clearInterval(timer); // Cleanup timer on unmount
      }
    } else if (
      currentScheduleDetail &&
      currentScheduleDetail.id === id &&
      currentScheduleDetail.status !== "in_progress"
    ) {
      // If schedule is found but not in_progress, redirect or show error
      console.warn(
        `Schedule ${id} is not in_progress. Status: ${currentScheduleDetail.status}`
      );
      // navigate('/'); // Redirect to home if not in_progress
    }
  }, [currentScheduleDetail, id, navigate]);

  const formatTime = (totalSeconds: number): string => {
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

  // Function to get current geolocation or fallback
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
              address: "Current Geolocation (Approximate)", // You might use a reverse geocoding API here
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Fallback to a default location if geolocation fails
            resolve({
              latitude: -6.2088, // Default latitude (e.g., Jakarta)
              longitude: 106.8456, // Default longitude (e.g., Jakarta)
              address: "Fallback Location (Jakarta, Indonesia)",
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.warn("Geolocation is not supported by this browser.");
        // Fallback to a default location if geolocation is not supported
        resolve({
          latitude: -6.2088, // Default latitude (e.g., Jakarta)
          longitude: 106.8456, // Default longitude (e.g., Jakarta)
          address: "Fallback Location (Jakarta, Indonesia)",
        });
      }
    });
  };

  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!currentVisit) return;
    // Update local state immediately for responsiveness
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: completed } : task
      )
    );
    // Send update to API
    await updateTaskStatus(currentVisit.id, taskId, completed);
    // Re-fetch current schedule to ensure store is updated
    if (id) {
      fetchScheduleById(id);
    }
  };

  const handleClockOut = async () => {
    if (!currentVisit) return;

    // Get current location using Geolocation API or fallback
    const currentLocation = await getCurrentLocation();

    // First, ensure all tasks are updated with their final status and reasons
    // This part requires a loop or a batch update if your API supports it.
    // For simplicity, we'll just send the main clock-out and rely on previous task updates.
    // If a task was marked 'No' and a reason was added, ensure that reason is sent.
    // (Note: The current updateTaskStatus only sends 'completed', not 'reason' for existing tasks.
    // You might need to extend updateTaskStatus or add a new API endpoint for final task submission with reasons.)

    // Call the endVisit action from Zustand
    await endVisit(currentVisit.id, currentLocation);

    // After successful clock-out, show the success modal
    setShowSuccessModal(true);
  };

  const handleGoHomeFromModal = () => {
    setShowSuccessModal(false); // Close modal
    navigate("/"); // Navigate to home page
  };

  const handleCancelClockIn = () => {
    console.log(`Cancelling clock-in for visit: ${currentVisit?.id}`);
    // In a real app, you might have an API call to cancel the in_progress status
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // --- Loading, Error, Not Found States (Preserving original structure) ---
  if (loading.currentScheduleDetail) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading visit details...</p>
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

  // If schedule is not found or not in 'in_progress' status
  if (
    !currentVisit ||
    currentVisit.id !== id ||
    currentVisit.status !== "in_progress"
  ) {
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
      {/* Back Button */}
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

      {/* Main Content Card */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-200">
        {/* Timer, Service Name & Client Info */}
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {formatTime(elapsedTime)}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {currentVisit.service_name}
          </h3>
          <div className="flex items-center mb-4">
            <img
              src={
                currentVisit.client_avatar ||
                "https://placehold.co/48x48/E0E7FF/4F46E5?text=NA"
              }
              alt={`${currentVisit.client_name} Avatar`}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full mr-4 border-2 border-indigo-300"
            />
            <span className="text-lg md:text-xl font-semibold text-gray-800">
              {currentVisit.client_name}
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
              {/* CORRECTED: Use startTime and endTime */}
              <span>
                {currentVisit.start_time} - {currentVisit.end_time}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
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
                    disabled={isActionLoading} // Disable buttons during action
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm md:text-base ${
                      task.completed
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    } ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleTaskCompletion(task.id, false)}
                    disabled={isActionLoading} // Disable buttons during action
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm md:text-base ${
                      !task.completed
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    } ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    No
                  </button>
                </div>
                {/* Optional: Input for reason if task is not completed */}
                {!task.completed && (
                  <textarea
                    placeholder="Add reason for not completing task..."
                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y text-sm md:text-base"
                    rows={2}
                    value={task.reason || ""} // Bind value to task.reason
                    onChange={(e) => {
                      // Update local task state with reason
                      setTasks((prevTasks) =>
                        prevTasks.map((t) =>
                          t.id === task.id
                            ? { ...t, reason: e.target.value }
                            : t
                        )
                      );
                      // You might want to debounce or send this to API on blur/clock-out
                    }}
                    disabled={isActionLoading}
                  ></textarea>
                )}
              </div>
            ))}
            {/* "Add new task" button (functionality not implemented in API yet) */}
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
              placeholder="Add reason for the overall visit (optional)..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y text-sm md:text-base"
              rows={3}
              value={addReason}
              onChange={(e) => setAddReason(e.target.value)}
              disabled={isActionLoading}
            ></textarea>
          </div>
        </div>

        {/* Clock-in Location Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
            Clock-in Location:
          </h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex items-center space-x-4">
            {/* Placeholder for Map */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 text-xs">
              Map Placeholder
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm md:text-base">
                {currentVisit.location.address}
              </p>
              <p className="text-sm text-gray-600">
                ({currentVisit.location.latitude},{" "}
                {currentVisit.location.longitude})
              </p>
            </div>
          </div>
        </div>

        {/* Service Notes Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
            Service Notes:
          </h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-gray-700 text-sm md:text-base">
            <p>{currentVisit.service_notes}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleCancelClockIn}
            disabled={isActionLoading}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 w-full sm:w-auto"
          >
            Cancel Clock-In
          </button>
          <button
            onClick={handleClockOut}
            disabled={isActionLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 w-full sm:w-auto"
          >
            {isActionLoading ? "Clocking Out..." : "Clock-Out"}
          </button>
        </div>
      </div>

      {/* Clock-Out Success Modal */}
      {showSuccessModal && (
        <ClockOutSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)} // Allows closing by clicking X
          onGoHome={handleGoHomeFromModal}
          date={currentVisit.shift_date} // Pass actual date from currentVisit
          timeRange={`${currentVisit.start_time} - ${currentVisit.end_time}`} // Pass actual timeRange from currentVisit
          duration={formatDuration(elapsedTime)} // Pass calculated duration
        />
      )}
    </div>
  );
};

export default ClockOutPage;
