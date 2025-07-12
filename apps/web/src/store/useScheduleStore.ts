import { create } from "zustand";
import type { Schedule, ScheduleStats } from "../types/api";

const BASE_API_URL = ""; // Leave empty, Vercel will resolve /api automatically.

interface ScheduleState {
  schedules: Schedule[];
  todaySchedules: Schedule[];
  currentScheduleDetail: Schedule | null;
  stats: ScheduleStats;
  loading: {
    schedules: boolean;
    todaySchedules: boolean;
    currentScheduleDetail: boolean;
    stats: boolean;
    action: boolean;
  };
  error: {
    schedules: string | null;
    todaySchedules: string | null;
    currentScheduleDetail: string | null;
    stats: string | null;
    action: string | null;
  };
}

interface ScheduleActions {
  fetchSchedules: () => Promise<void>;
  fetchTodaySchedules: () => Promise<void>;
  fetchScheduleById: (id: string) => Promise<void>;
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
  currentScheduleDetail: null,
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
    currentScheduleDetail: false,
    stats: false,
    action: false,
  },
  error: {
    schedules: null,
    todaySchedules: null,
    currentScheduleDetail: null,
    stats: null,
    action: null,
  },

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
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to fetch schedules:", err);
      set((state) => ({ error: { ...state.error, schedules: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, schedules: false } }));
    }
  },

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
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      set((state) => ({ error: { ...state.error, stats: err.message } }));
    } finally {
      set((state) => ({ loading: { ...state.loading, stats: false } }));
    }
  },

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
      await get().fetchSchedules();
      await get().fetchTodaySchedules();
      await get().fetchStats();
      alert("Sample data reset successfully!");
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to reset sample data:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error resetting data: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },

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
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === scheduleId ? { ...s, status: "in_progress" } : s
        ),
        todaySchedules: state.todaySchedules.map((s) =>
          s.id === scheduleId ? { ...s, status: "in_progress" } : s
        ),
        currentScheduleDetail:
          state.currentScheduleDetail?.id === scheduleId
            ? { ...state.currentScheduleDetail, status: "in_progress" }
            : state.currentScheduleDetail,
      }));
      alert("Visit started successfully!");
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to start visit:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error starting visit: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },

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
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === scheduleId ? { ...s, status: "completed" } : s
        ),
        todaySchedules: state.todaySchedules.map((s) =>
          s.id === scheduleId ? { ...s, status: "completed" } : s
        ),
        currentScheduleDetail:
          state.currentScheduleDetail?.id === scheduleId
            ? { ...state.currentScheduleDetail, status: "completed" }
            : state.currentScheduleDetail,
      }));
      alert("Visit ended successfully!");
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to end visit:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error ending visit: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },

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
        todaySchedules: state.todaySchedules.map((s) =>
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
            : state.currentScheduleDetail,
      }));
      // eslint-disable-next-line
    } catch (err: any) {
      console.error("Failed to update task status:", err);
      set((state) => ({ error: { ...state.error, action: err.message } }));
      alert(`Error updating task status: ${err.message}`);
    } finally {
      set((state) => ({ loading: { ...state.loading, action: false } }));
    }
  },
}));
