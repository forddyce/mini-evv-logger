import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import ScheduleCard from "../components/ScheduleCard";
import ActiveVisitCard from "../components/ActiveVisitCard";
import { useScheduleStore } from "../store/useScheduleStore"; // Import the Zustand store
import type { Schedule } from "../types/api"; // Import Schedule type

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const {
    schedules,
    todaySchedules, // Keep this for potential future use or if the original design implicitly used it
    stats,
    loading,
    error,
    fetchSchedules,
    fetchTodaySchedules, // Fetch this as well to populate the store, even if not directly displayed
    fetchStats,
    resetSampleData,
    startVisit,
    endVisit,
    updateTaskStatus, // Keep this for ScheduleCard if tasks are managed there
  } = useScheduleStore();

  // Determine active visit from fetched schedules
  const activeVisit = schedules.find((s) => s.status === "in_progress"); // Use snake_case here

  useEffect(() => {
    // Fetch initial data when the component mounts
    fetchSchedules();
    fetchTodaySchedules(); // Fetch today's schedules to populate the store
    fetchStats();
  }, [fetchSchedules, fetchTodaySchedules, fetchStats]);

  const isActionLoading = loading.action;

  // Function to get current geolocation or fallback (reused from ScheduleCard logic)
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
        resolve({
          latitude: -6.2088, // Default latitude (e.g., Jakarta)
          longitude: 106.8456, // Default longitude (e.g., Jakarta)
          address: "Fallback Location (Jakarta, Indonesia)",
        });
      }
    });
  };

  // IMPORTANT: Updated handleClockIn to match ScheduleCard's onClockIn signature
  const handleClockIn = async (scheduleId: string) => {
    if (activeVisit) {
      alert(
        "Cannot clock in to a new schedule while another is active. Please clock out first."
      );
      return;
    }
    const currentLocation = await getCurrentLocation();
    await startVisit(scheduleId, currentLocation);
    // After successful API call, re-fetch to update UI
    fetchSchedules();
    fetchTodaySchedules();
    fetchStats();
  };

  const handleClockOut = async (scheduleId: string) => {
    const currentLocation = await getCurrentLocation();
    await endVisit(scheduleId, currentLocation);
    // After successful API call, re-fetch to update UI
    fetchSchedules();
    fetchTodaySchedules();
    fetchStats();
  };

  const handleViewDetails = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      if (schedule.status === "scheduled") {
        navigate(`/schedule/details/${scheduleId}`);
      } else if (schedule.status === "in_progress") {
        // Use snake_case here
        navigate(`/clock-out/${scheduleId}`);
      } else if (schedule.status === "completed") {
        // Use snake_case here
        // For completed, you might navigate to a "View Report" page
        console.log(`Viewing report for completed schedule: ${scheduleId}`);
        navigate(`/schedule/details/${scheduleId}`); // For now, navigate to details page
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Active Visit Card */}
      {activeVisit && (
        <ActiveVisitCard
          clientName={activeVisit.client_name}
          location={activeVisit.location.address} // Use address from parsed location
          timeRange={`${activeVisit.start_time} - ${activeVisit.end_time}`}
          onClockOut={() => handleClockOut(activeVisit.id)}
        />
      )}

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {loading.stats ? (
          <>
            <DashboardCard
              count={0}
              title="Loading..."
              colorClass="text-gray-500"
            />
            <DashboardCard
              count={0}
              title="Loading..."
              colorClass="text-gray-500"
            />
            <DashboardCard
              count={0}
              title="Loading..."
              colorClass="text-gray-500"
            />
          </>
        ) : error.stats ? (
          <div className="col-span-full text-red-500 text-center">
            Error loading stats: {error.stats}
          </div>
        ) : (
          <>
            <DashboardCard
              count={stats.missedSchedules}
              title="Missed Scheduled"
              colorClass="text-red-600"
            />
            <DashboardCard
              count={stats.upcomingToday}
              title="Upcoming Today's Schedule"
              colorClass="text-orange-600"
            />
            <DashboardCard
              count={stats.completedToday}
              title="Today's Completed Schedule"
              colorClass="text-green-600"
            />
          </>
        )}
      </div>

      {/* Schedule Section Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Schedule</h3>
        <div className="flex space-x-4">
          {" "}
          {/* Container for buttons */}
          <button
            onClick={resetSampleData} // Hooked to resetSampleData
            disabled={isActionLoading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            {isActionLoading ? "Resetting..." : "Reset Data"}
          </button>
          <button
            onClick={() => console.log("Add New clicked")} // Reverted to original behavior
            className="text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
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
            Add New
          </button>
        </div>
      </div>

      {/* All Schedules List */}
      <div className="space-y-6">
        {loading.schedules ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedules...</p>
          </div>
        ) : error.schedules ? (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error.schedules}</span>
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No schedules found.</p>
        ) : (
          schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              id={schedule.id}
              status={schedule.status}
              clientName={schedule.client_name}
              serviceName={schedule.service_name}
              location={schedule.location.address} // Pass the address string
              date={schedule.shift_date}
              timeRange={`${schedule.start_time} - ${schedule.end_time}`} // Construct timeRange string
              isActive={activeVisit?.id === schedule.id}
              isAnyActive={activeVisit !== null && activeVisit !== undefined}
              onClockIn={handleClockIn} // Pass the modified handleClockIn
              onClockOut={handleClockOut}
              onViewDetails={handleViewDetails}
              clientAvatar={schedule.client_avatar} // Pass clientAvatar
              isActionLoading={isActionLoading} // Pass the loading state to disable buttons
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
