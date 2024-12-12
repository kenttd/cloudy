import { create } from "zustand";

interface UserState {
  user: any;
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;
  fetchUser: (url: string) => Promise<void>;
  refresh: (url: string) => Promise<void>;
}

const useUserStore = create<UserState>((set) => ({
  user: {},
  isFetched: false,
  isLoading: false,
  error: null,
  fetchUser: async (url: string) => {
    // If already fetched, don't fetch again
    if (useUserStore.getState().isFetched) return;

    set({ isLoading: true });
    try {
      const response = await fetch(url);
      const data = await response.json();
      set({ user: data, isFetched: true, isLoading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: "An unknown error occurred", isLoading: false });
      }
    }
  },
  refresh: async (url: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(url);
      const data = await response.json();
      set({ user: data, isFetched: true, isLoading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: "An unknown error occurred", isLoading: false });
      }
    }
  },
}));

export default useUserStore;
