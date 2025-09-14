import { create } from "zustand";
import { useProjectStore, defaultNode } from "./useProjectStore";

export const useNodeStore = create((set, get) => ({
  addNode: (floorId, node) => {
    const newNode = {
      ...defaultNode,
      ...node,
      nodeId: node.nodeId || crypto.randomUUID(), // ✅ always have nodeId
    };

    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId ? { ...f, nodes: [...f.nodes, newNode] } : f
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
                  n.nodeId === nodeId ? { ...n, ...updates } : n
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
            ? { ...f, nodes: f.nodes.filter((n) => n.nodeId !== nodeId) }
            : f
        ),
      },
    }));
  },
}));
