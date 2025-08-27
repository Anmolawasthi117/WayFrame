import { create } from "zustand";
import { useProjectStore } from "./useProjectStore";

export const useNodeStore = create((set, get) => ({
  addNode: (floorId, node) => {
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId ? { ...f, nodes: [...f.nodes, { id: Date.now(), ...node }] } : f
        ),
      },
    }));
  },

  updateNode: (floorId, nodeId, updates) => {
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId
            ? {
                ...f,
                nodes: f.nodes.map((n) =>
                  n.id === nodeId ? { ...n, ...updates } : n
                ),
              }
            : f
        ),
      },
    }));
  },

  removeNode: (floorId, nodeId) => {
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId
            ? { ...f, nodes: f.nodes.filter((n) => n.id !== nodeId) }
            : f
        ),
      },
    }));
  },
}));
