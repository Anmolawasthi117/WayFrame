import { create } from "zustand";

export const useUiStore = create((set) => ({
  selectedNodeId: null,
  selectedConnectionId: null,
  showInspector: true,
  zoom: 1,
  pan: { x: 0, y: 0 },

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setSelectedConnection: (id) => set({ selectedConnectionId: id }),
  toggleInspector: () => set((s) => ({ showInspector: !s.showInspector })),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
}));
