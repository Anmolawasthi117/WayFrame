// src/store/useHistoryStore.js
import { create } from "zustand";
import { useProjectStore } from "./useProjectStore";

export const useHistoryStore = create((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 50,

  // Save the current project state into history
  saveState: () => {
    const projectState = useProjectStore.getState().project;
    const { history, currentIndex, maxHistorySize } = get();

    // Deep clone safely (structuredClone is better than JSON.parse/stringify)
    const snapshot = structuredClone(projectState);

    // Skip if no changes compared to the last snapshot
    if (
      currentIndex >= 0 &&
      JSON.stringify(history[currentIndex]) === JSON.stringify(snapshot)
    ) {
      return;
    }

    // Remove any future states if we're not at the end (redo branch)
    let newHistory = history.slice(0, currentIndex + 1);

    // Add the new snapshot
    newHistory.push(snapshot);

    // Enforce max history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    // Update index after push (adjusting if shift happened)
    const newIndex = Math.min(newHistory.length - 1, currentIndex + 1);

    set({ history: newHistory, currentIndex: newIndex });
  },

  undo: () => {
    const { history, currentIndex } = get();
    if (currentIndex > 0) {
      const prevState = history[currentIndex - 1];
      useProjectStore.setState({ project: structuredClone(prevState) });
      set({ currentIndex: currentIndex - 1 });
    }
  },

  redo: () => {
    const { history, currentIndex } = get();
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      useProjectStore.setState({ project: structuredClone(nextState) });
      set({ currentIndex: currentIndex + 1 });
    }
  },

  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().history.length - 1,

  clearHistory: () => set({ history: [], currentIndex: -1 }),
}));
