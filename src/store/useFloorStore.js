import { create } from "zustand";
import { useProjectStore, defaultFloor } from "./useProjectStore";

export const useFloorStore = create((set, get) => ({
  addFloor: (floorData) => {
    const cleanFloor = { ...defaultFloor, id: Date.now().toString(), ...floorData };

    useProjectStore.setState((state) => {
      const updatedFloors = [...state.project.floors, cleanFloor];
      return {
        project: { ...state.project, floors: updatedFloors },
        activeFloorId: cleanFloor.id,
      };
    });

    return cleanFloor.id;
  },

  updateFloor: (floorId, updates) => {
    const { imgUrl, ...cleanUpdates } = updates; // 🚫 strip UI-only stuff
    useProjectStore.setState((state) => ({
      project: {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId ? { ...f, ...cleanUpdates } : f
        ),
      },
    }));
  },

  removeFloor: (floorId) => {
    useProjectStore.setState((state) => {
      const updatedFloors = state.project.floors.filter((f) => f.id !== floorId);
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
