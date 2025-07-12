// apps/web/src/store/useScheduleStore.ts

import { create } from "zustand";
import type { Schedule, ScheduleStats, Task } from "../types/api"; // Import types

// Base URL for your API. On Vercel, this will be your deployed domain.
// Locally, it will be Vercel CLI's proxy (e.g., http://localhost:3000).
// The /api prefix is handled by Vercel's routing.
const BASE_API_URL = ""; // Leave empty, Vercel will resolve /api automatically.

interface ScheduleState {
  schedules: Schedule[];
  todaySchedules: Schedule[];
  currentScheduleDetail: Schedule | null; // New: For detailed view of a single schedule
  stats: ScheduleStats;
  loading: {
    schedules: boolean;
    todaySchedules: boolean;
    currentScheduleDetail: boolean; // New: Loading state for single schedule
    stats: boolean;
    action: boolean; // For reset, start/end visit, update task
  };
  error: {
    schedules: string | null;
    todaySchedules: string | null;
    currentScheduleDetail: string | null; // New: Error state for single schedule
    stats: string | null;
    action: string | null;
  };
}

interface ScheduleActions {
  fetchSchedules: () => Promise<void>;
  fetchTodaySchedules: () => Promise<void>;
  fetchScheduleById: (id: string) => Promise<void>; // New: Action to fetch single schedule
  fetchStats: () => Promise<void>;
  resetSampleData: () => Promise<void>;
  startVisit: (
    scheduleId: string,
    location: { latitude: number; longitude: number; address: string }
  ) => Promise<void>;
  endVisit: (
    scheduleId: string,
    location: { latitude: number; longitude: number; address: string }
  ) => Promise<void>;
  updateTaskStatus: (
    scheduleId: string,
    taskId: string,
    completed: boolean,
    reason: string
  ) => Promise<void>;
}

type ScheduleStore = ScheduleState & ScheduleActions;

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: [],
  todaySchedules: [],
  currentScheduleDetail: null, // Initialize new state
  stats: {
    totalSchedules: 0,
    completedSchedules: 0,
    scheduledSchedules: 0,
    cancelledSchedules: 0,
    missedSchedules: 0,
    upcomingToday: 0,
    completedToday: 0,
  },
  loading: {
    schedules: false,
    todaySchedules: false,
    currentScheduleDetail: false, // Initialize new loading state
    stats: false,
    action: false,
  },
  error: {
    schedules: null,
    todaySchedules: null,
    currentScheduleDetail: null, // Initialize new error state
    stats: null,
    action: null,
  },

  // Action to fetch all schedules
  fetchSchedules: async () => {
    set((state) => ({
      loading: { ...state.loading, schedules: true },
      error: { ...state.error, schedules: null },
    }));
    try {
      const response = await fetch(`${BASE_API_URL}/api/schedules`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Schedule[] = await response.json();
      set({ schedules: data });
    } catch (err: any) {
      console.error("Failed to fetch schedules:", err);
      set((state) => ({ error: { ...state.error, schedules: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, schedules: false } }));
    }
  },

  // Action to fetch today's schedules (kept in store but not used by HomePage)
  fetchTodaySchedules: async () => {
    set((state) => ({
      loading: { ...state.loading, todaySchedules: true },
      error: { ...state.error, todaySchedules: null },
    }));
    try {
      const response = await fetch(`${BASE_API_URL}/api/schedules/today`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Schedule[] = await response.json();
      set({ todaySchedules: data });
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to fetch today schedules:", err);
      set((state) => ({
        error: { ...state.error, todaySchedules: err.message },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, todaySchedules: false },
      }));
    }
  },

  // New: Action to fetch a single schedule by ID
  fetchScheduleById: async (id: string) => {
    set((state) => ({
      loading: { ...state.loading, currentScheduleDetail: true },
      error: { ...state.error, currentScheduleDetail: null },
      currentScheduleDetail: null,
    }));
    try {
      const response = await fetch(`${BASE_API_URL}/api/schedules/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Schedule = await response.json();
      set({ currentScheduleDetail: data });
      // eslint-disable-next-line
    } catch (err: any) {
      console.error(`Failed to fetch schedule by ID ${id}:`, err);
      set((state) => ({
        error: { ...state.error, currentScheduleDetail: err.message },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, currentScheduleDetail: false },
      }));
    }
  },

  // Action to fetch schedule statistics
  fetchStats: async () => {
    set((state) => ({
      loading: { ...state.loading, stats: true },
      error: { ...state.error, stats: null },
    }));
    try {
      const response = await fetch(`${BASE_API_URL}/api/schedules/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ScheduleStats = await response.json();
      set({ stats: data });
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      set((state) => ({ error: { ...state.error, stats: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, stats: false } }));
    }
  },

  // Action to reset sample data
  resetSampleData: async () => {
    set((state) => ({
      loading: { ...state.loading, action: true },
      error: { ...state.error, action: null },
    }));
    try {
      const response = await fetch(`${BASE_API_URL}/api/schedules/reset`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Re-fetch all data after reset
      await get().fetchSchedules();
      await get().fetchTodaySchedules(); // Keep this call to ensure store consistency
      await get().fetchStats();
      alert("Sample data reset successfully!"); // Using alert for simplicity, consider a custom modal
    } catch (err: any) {
      console.error("Failed to reset sample data:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error resetting data: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },

  // Action to start a visit
  startVisit: async (scheduleId, location) => {
    set((state) => ({
      loading: { ...state.loading, action: true },
      error: { ...state.error, action: null },
    }));
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/schedules/${scheduleId}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update the status of the specific schedule in the store
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === scheduleId ? { ...s, status: "in_progress" } : s
        ),
        todaySchedules: state.todaySchedules.map(
          (
            s // Update todaySchedules too
          ) => (s.id === scheduleId ? { ...s, status: "in_progress" } : s)
        ),
        currentScheduleDetail:
          state.currentScheduleDetail?.id === scheduleId
            ? { ...state.currentScheduleDetail, status: "in_progress" }
            : state.currentScheduleDetail, // Update detail page too
      }));
      alert("Visit started successfully!");
    } catch (err: any) {
      console.error("Failed to start visit:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error starting visit: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },

  // Action to end a visit
  endVisit: async (scheduleId, location) => {
    set((state) => ({
      loading: { ...state.loading, action: true },
      error: { ...state.error, action: null },
    }));
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/schedules/${scheduleId}/end`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update the status of the specific schedule in the store
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === scheduleId ? { ...s, status: "completed" } : s
        ),
        todaySchedules: state.todaySchedules.map(
          (
            s // Update todaySchedules too
          ) => (s.id === scheduleId ? { ...s, status: "completed" } : s)
        ),
        currentScheduleDetail:
          state.currentScheduleDetail?.id === scheduleId
            ? { ...state.currentScheduleDetail, status: "completed" }
            : state.currentScheduleDetail, // Update detail page too
      }));
      alert("Visit ended successfully!");
    } catch (err: any) {
      console.error("Failed to end visit:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error ending visit: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },

  // Action to update task status
  updateTaskStatus: async (
    scheduleId,
    taskId,
    completed,
    reason = "please input reason"
  ) => {
    set((state) => ({
      loading: { ...state.loading, action: true },
      error: { ...state.error, action: null },
    }));
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/tasks/${taskId}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed, reason }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update the task status in the store
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === scheduleId
            ? {
                ...s,
                tasks: s.tasks?.map((t) =>
                  t.id === taskId ? { ...t, completed, reason } : t
                ),
              }
            : s
        ),
        todaySchedules: state.todaySchedules.map(
          (
            s // Update todaySchedules too
          ) =>
            s.id === scheduleId
              ? {
                  ...s,
                  tasks: s.tasks?.map((t) =>
                    t.id === taskId ? { ...t, completed, reason } : t
                  ),
                }
              : s
        ),
        currentScheduleDetail:
          state.currentScheduleDetail?.id === scheduleId
            ? {
                ...state.currentScheduleDetail,
                tasks: state.currentScheduleDetail.tasks?.map((t) =>
                  t.id === taskId ? { ...t, completed, reason } : t
                ),
              }
            : state.currentScheduleDetail, // Update detail page too
      }));
      // alert("Task status updated successfully!");
    } catch (err: any) {
      console.error("Failed to update task status:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error updating task status: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },
}));
