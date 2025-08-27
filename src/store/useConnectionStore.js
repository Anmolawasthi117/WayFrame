import { create } from "zustand";
import { useProjectStore } from "./useProjectStore";

export const useConnectionStore = create((set, get) => ({
  addConnection: (from, to, distance = 1, type = "default") => {
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        connections: [
          ...state.project.connections,
          { id: Date.now(), from, to, distance, type },
        ],
      },
    }));
  },

  removeConnection: (id) => {
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        connections: state.project.connections.filter((c) => c.id !== id),
      },
    }));
  },
}));
