// src/store/useSchemaStore.js
import { create } from "zustand";
import { defaultProjectSchema } from "../utils/defaultSchema";

export const useSchemaStore = create((set, get) => ({
  schema: defaultProjectSchema,

  updateSchema: (partial) =>
    set((state) => ({
      schema: {
        ...state.schema,
        ...partial,
        building: {
          ...state.schema.building,
          updatedAt: new Date().toISOString(),
        },
      },
    })),

  resetSchema: () => set({ schema: defaultProjectSchema }),

  importSchema: (newSchema) => {
    try {
      set({ schema: newSchema });
    } catch (e) {
      console.error("Invalid schema import:", e);
    }
  },

  exportSchema: () => JSON.stringify(get().schema, null, 2),
}));
