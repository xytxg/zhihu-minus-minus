import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 适配器：让 Zustand 能用上 Expo 的安全存储
const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

interface ProgressEntry {
  offset: number;
  updatedAt: number;
}

interface ProgressState {
  progress: Record<string, ProgressEntry>;
  saveProgress: (id: string, offset: number) => void;
  getProgress: (id: string) => number;
  clearProgress: () => void;
}

const MAX_PROGRESS_ENTRIES = 100;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      saveProgress: (id, offset) => {
        if (!id) return;
        const { progress } = get();
        const newProgress = {
          ...progress,
          [id]: { offset, updatedAt: Date.now() },
        };

        // 限制存储条数：保留最近更新的 100 条
        const keys = Object.keys(newProgress);
        if (keys.length > MAX_PROGRESS_ENTRIES) {
          const sortedKeys = keys.sort(
            (a, b) => newProgress[b].updatedAt - newProgress[a].updatedAt,
          );
          const keysToRemove = sortedKeys.slice(MAX_PROGRESS_ENTRIES);
          for (const key of keysToRemove) {
            delete newProgress[key];
          }
        }

        set({ progress: newProgress });
      },

      getProgress: (id) => {
        if (!id) return 0;
        return get().progress[id]?.offset || 0;
      },

      clearProgress: () => set({ progress: {} }),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
