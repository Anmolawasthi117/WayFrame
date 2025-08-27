import { create } from "zustand";

const STORAGE_KEY = "map_editor_floors";

// helper: convert file to base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

// load state from localStorage
const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { floors: [], activeFloorId: null };
  } catch {
    return { floors: [], activeFloorId: null };
  }
};

export const useFloorStore = create((set, get) => ({
  ...loadFromStorage(),

  // add a new floor
  addFloor: async (file) => {
    const id = Date.now().toString();
    const base64 = await fileToBase64(file);

    const floor = {
      id,
      name: file.name.replace(/\.[^/.]+$/, ""),
      imageUrl: base64, // safe to persist
    };

    const newState = {
      floors: [...get().floors, floor],
      activeFloorId: id,
    };

    set(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  },

  // remove floor
  removeFloor: (id) => {
    const newFloors = get().floors.filter((f) => f.id !== id);
    const newState = {
      floors: newFloors,
      activeFloorId:
        get().activeFloorId === id ? newFloors[0]?.id ?? null : get().activeFloorId,
    };

    set(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  },

  // set active floor
  setActiveFloor: (id) => {
    const newState = { ...get(), activeFloorId: id };
    set(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  },
}));
