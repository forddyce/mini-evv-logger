import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import ScheduleCard from "../components/ScheduleCard";
import ActiveVisitCard from "../components/ActiveVisitCard";

interface Schedule {
  id: string;
  status: "Scheduled" | "In progress" | "Completed" | "Cancelled";
  clientName: string;
  serviceName: string;
  location: string;
  date: string;
  timeRange: string;
}

const ALL_SCHEDULES: Schedule[] = [
  {
    id: "sch-001",
    status: "Scheduled",
    clientName: "Melisa Adam",
    serviceName: "Service Name A",
    location: "Casa Grande Apartment",
    date: "Mon, 15 Jan 2025",
    timeRange: "09:00 - 10:00",
  },
  {
    id: "sch-002",
    status: "Scheduled",
    clientName: "John Doe",
    serviceName: "Service Name B",
    location: "123 Main St, Anytown",
    date: "Mon, 15 Jan 2025",
    timeRange: "11:00 - 12:00",
  },
  {
    id: "sch-003",
    status: "Scheduled",
    clientName: "Jane Smith",
    serviceName: "Service Name C",
    location: "456 Oak Ave, Othercity",
    date: "Mon, 15 Jan 2025",
    timeRange: "13:00 - 14:00",
  },
  {
    id: "sch-004",
    status: "Completed",
    clientName: "Emily White",
    serviceName: "Service Name D",
    location: "789 Pine Ln, Somewhere",
    date: "Mon, 15 Jan 2025",
    timeRange: "15:00 - 16:00",
  },
  {
    id: "sch-005",
    status: "Cancelled",
    clientName: "David Green",
    serviceName: "Service Name E",
    location: "101 Elm Rd, Nowhere",
    date: "Mon, 15 Jan 2025",
    timeRange: "17:00 - 18:00",
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [activeVisit, setActiveVisit] = useState<{
    id: string;
    clientName: string;
    location: string;
    timeRange: string;
  } | null>(null);

  const [schedules, setSchedules] = useState<Schedule[]>(ALL_SCHEDULES);

  const handleClockIn = (
    scheduleId: string,
    clientName: string,
    location: string,
    timeRange: string
  ) => {
    if (activeVisit) {
      console.warn(
        "Cannot clock in to a new schedule while another is active."
      );
      return;
    }

    setActiveVisit({ id: scheduleId, clientName, location, timeRange });

    setSchedules((prevSchedules) =>
      prevSchedules.map((sch) =>
        sch.id === scheduleId ? { ...sch, status: "In progress" } : sch
      )
    );
    console.log(`Clocked in to schedule: ${scheduleId}`);
  };

  const handleClockOut = (scheduleId: string) => {
    if (activeVisit && activeVisit.id === scheduleId) {
      setActiveVisit(null);
      setSchedules((prevSchedules) =>
        prevSchedules.map((sch) =>
          sch.id === scheduleId ? { ...sch, status: "Completed" } : sch
        )
      );
      console.log(`Clocked out from schedule: ${scheduleId}`);
    } else {
      console.warn(
        "Attempted to clock out from a non-active or non-matching schedule."
      );
    }
  };

  const handleViewDetails = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      if (schedule.status === "Scheduled") {
        navigate(`/schedule/details/${scheduleId}`);
      } else if (schedule.status === "In progress") {
        navigate(`/clock-out/${scheduleId}`);
      } else if (schedule.status === "Completed") {
        console.log(`Viewing report for completed schedule: ${scheduleId}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {activeVisit && (
        <ActiveVisitCard
          clientName={activeVisit.clientName}
          location={activeVisit.location}
          timeRange={activeVisit.timeRange}
          onClockOut={() => handleClockOut(activeVisit.id)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <DashboardCard
          count={7}
          title="Missed Scheduled"
          colorClass="text-red-600"
        />
        <DashboardCard
          count={12}
          title="Upcoming Today's Schedule"
          colorClass="text-orange-600"
        />
        <DashboardCard
          count={5}
          title="Today's Completed Schedule"
          colorClass="text-green-600"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Schedule</h3>
        <button className="text-blue-600 hover:text-blue-800 font-semibold">
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

      <div className="space-y-6">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            {...schedule}
            isActive={activeVisit?.id === schedule.id}
            isAnyActive={activeVisit !== null}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
