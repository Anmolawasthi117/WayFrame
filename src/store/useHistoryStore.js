// src/store/useHistoryStore.js
import { create } from "zustand";
import { useProjectStore } from "./useProjectStore";

export const useHistoryStore = create((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 50,

  saveState: () => {
    const projectState = useProjectStore.getState().project;
    const { history, currentIndex, maxHistorySize } = get();
    
    // Remove any future states if we're not at the end
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add new state
    newHistory.push(JSON.parse(JSON.stringify(projectState)));
    
    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    } else {
      set({ currentIndex: currentIndex + 1 });
    }
    
    set({ history: newHistory });
  },

  undo: () => {
    const { history, currentIndex } = get();
    if (currentIndex > 0) {
      const prevState = history[currentIndex - 1];
      useProjectStore.setState({ project: prevState });
      set({ currentIndex: currentIndex - 1 });
    }
  },

  redo: () => {
    const { history, currentIndex } = get();
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      useProjectStore.setState({ project: nextState });
      set({ currentIndex: currentIndex + 1 });
    }
  },

  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().history.length - 1,

  clearHistory: () => set({ history: [], currentIndex: -1 }),
}));