import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultProjectSchema = {
  meta: { name: "Untitled Project", createdAt: Date.now() },
  floors: [],          // each floor: { id, name, nodes: [] }
  connections: [],     // { from: nodeId, to: nodeId }
};

export const useProjectStore = create(
  persist(
    (set, get) => ({
      project: defaultProjectSchema,
      activeFloorId: null,
      selectedNodeId: null,

      // ---------------- FLOORS ----------------
      setActiveFloor: (id) => set({ activeFloorId: id }),
      addFloor: (floor) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: [...state.project.floors, { ...floor, nodes: [] }],
          },
        })),

      // ---------------- META ----------------
      updateMeta: (meta) =>
        set((state) => ({
          project: { ...state.project, meta: { ...state.project.meta, ...meta } },
        })),

      // ---------------- NODES ----------------
      addNode: (floorId, node) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId ? { ...f, nodes: [...f.nodes, node] } : f
            ),
          },
        })),

      updateNode: (floorId, nodeId, updates) =>
        set((state) => ({
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
        })),

      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

      // ---------------- CONNECTIONS ----------------
      addConnection: (from, to) =>
        set((state) => ({
          project: {
            ...state.project,
            connections: [...state.project.connections, { from, to }],
          },
        })),

      removeConnection: (from, to) =>
        set((state) => ({
          project: {
            ...state.project,
            connections: state.project.connections.filter(
              (c) => !(c.from === from && c.to === to)
            ),
          },
        })),

      // ---------------- IMPORT / EXPORT ----------------
      importProject: (json) => set({ project: JSON.parse(json) }),
      exportProject: () => {
  const raw = get().project;

  // deep clone and sanitize
  const cleanProject = {
    ...raw,
    floors: raw.floors.map(floor => ({
      ...floor,
      // remove imageUrl or any heavy UI-only fields
      ...(floor.imageUrl ? {} : {}),
      nodes: floor.nodes.map(node => ({
        ...node,
        // also strip UI-only stuff if needed
        ...(node.imageUrl ? {} : {}),
      })),
    })),
  };

  // Explicitly delete unwanted props
  cleanProject.floors.forEach(floor => {
    delete floor.imageUrl;
    floor.nodes.forEach(node => {
      delete node.imageUrl;
    });
  });

  return JSON.stringify(cleanProject, null, 2);
},


      // ---------------- RESET ----------------
      reset: () => set({ project: defaultProjectSchema, activeFloorId: null, selectedNodeId: null }),
    }),
    {
      name: "wayframe-project", // persisted in localStorage
    }
  )
);
