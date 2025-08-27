import { create } from "zustand";

// this is the **blueprint** of schema, not actual project data
const defaultSchema = {
  node: {
    nodeId: "string",
    name: "string",
    coordinates: {
      x: "number",
      y: "number",
      floor: "number",
    },
    type: {
      type: "enum",
      values: ["room", "hallway", "stair", "elevator"],
    },
    connections: [
      {
        nodeId: "string",
        distance: "number",
      },
    ],
    meta: "object",
  },
  connection: {
    from: "string",
    to: "string",
    distance: "number",
  },
  floor: {
    id: "string",
    name: "string",
    level: "number",
    imageUrl: "string",
    nodes: "array",
  },
};

export const useSchemaStore = create((set, get) => ({
  schema: defaultSchema,

  updateSchema: (part) =>
    set((state) => ({
      schema: {
        ...state.schema,
        ...part,
      },
    })),

  resetSchema: () => set({ schema: defaultSchema }),

  importSchema: (newSchema) => {
    try {
      set({ schema: newSchema });
    } catch (e) {
      console.error("Invalid schema import:", e);
    }
  },

  exportSchema: () => JSON.stringify(get().schema, null, 2),
}));
