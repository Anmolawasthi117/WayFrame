import { create } from "zustand";
import { useProjectStore } from "./useProjectStore";

export const useFloorStore = create((set, get) => ({
  addFloor: (floorData) => {
    const newFloor = { id: Date.now(), nodes: [], ...floorData };

    useProjectStore.setState((state) => {
      const updatedFloors = [...state.project.floors, newFloor];
      return {
        project: { ...state.project, floors: updatedFloors },
        activeFloorId: newFloor.id, // new floor ko active bhi kar do
      };
    });

    return newFloor.id; // id return karo
  },

  updateFloor: (floorId, updates) => {
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId ? { ...f, ...updates } : f
        ),
      },
    }));
  },

  removeFloor: (floorId) => {
    useProjectStore.setState((state) => {
      const updatedFloors = state.project.floors.filter((f) => f.id !== floorId);

      // agar delete hua floor active tha → new active set karo
      let newActiveId = state.activeFloorId;
      if (state.activeFloorId === floorId) {
        newActiveId = updatedFloors.length ? updatedFloors[0].id : null;
      }

      return {
        project: { ...state.project, floors: updatedFloors },
        activeFloorId: newActiveId,
      };
    });
  },
}));
