import { create } from "zustand";
import {
  defaultProjectSchema,
  defaultFloor,
  defaultNode,
  defaultConnection,
} from "../utils/defaultSchema";
import { saveToIndexedDB, loadFromIndexedDB } from "../libs/db";

const STORAGE_KEY = "campus-map-project";

// Helper: Load project state
const loadState = async () => {
  const indexed = await loadFromIndexedDB(STORAGE_KEY);
  if (indexed) return indexed;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultProjectSchema;
  } catch {
    return defaultProjectSchema;
  }
};

// Helper: Save project state
const saveState = async (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    await saveToIndexedDB(STORAGE_KEY, state);
  } catch (e) {
    console.error("Error saving state:", e);
  }
};

export const useProjectStore = create((set, get) => ({
  project: defaultProjectSchema,
  history: [], // 🔙 Undo stack
  future: [], // 🔁 Redo stack

  // ─── INIT ───────────────────────────────────────
  init: async () => {
    const data = await loadState();
    set({ project: data });
  },

  // 🔁 Helper to push current state into history
  pushToHistory: () => {
    const { project, history } = get();
    const snapshot = JSON.parse(JSON.stringify(project)); // deep clone
    set({
      history: [...history, snapshot],
      future: [], // clear redo stack on new action
    });
  },

  // 🔙 Undo
  undo: () => {
    const { history, project, future } = get();
    if (history.length === 0) return; // nothing to undo

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Push current to future stack
    set({
      project: previous,
      history: newHistory,
      future: [JSON.parse(JSON.stringify(project)), ...future],
    });

    saveState(previous);
  },

  // 🔁 Redo
  redo: () => {
    const { future, project, history } = get();
    if (future.length === 0) return; // nothing to redo

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      project: next,
      future: newFuture,
      history: [...history, JSON.parse(JSON.stringify(project))],
    });

    saveState(next);
  },

  // ─── FLOOR MANAGEMENT ──────────────────────────
  addFloor: (name, level, imageUrl = "") =>
    set(async (state) => {
      get().pushToHistory(); // snapshot before change
      const newProject = {
        ...state.project,
        floors: [
          ...state.project.floors,
          { ...defaultFloor, id: crypto.randomUUID(), name, level, imageUrl },
        ],
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  removeFloor: (floorId) =>
    set(async (state) => {
      get().pushToHistory();
      const newProject = {
        ...state.project,
        floors: state.project.floors.filter((f) => f.id !== floorId),
        connections: state.project.connections.filter(
          (c) => c.from.floorId !== floorId && c.to.floorId !== floorId
        ),
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  // ─── NODE MANAGEMENT ───────────────────────────
  addNode: (floorId, node = {}) =>
    set(async (state) => {
      get().pushToHistory();
      const newProject = {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId
            ? {
                ...f,
                nodes: [
                  ...f.nodes,
                  { ...defaultNode, nodeId: crypto.randomUUID(), ...node },
                ],
              }
            : f
        ),
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  removeNode: (floorId, nodeId) =>
    set(async (state) => {
      get().pushToHistory();
      const newProject = {
        ...state.project,
        floors: state.project.floors.map((f) =>
          f.id === floorId
            ? {
                ...f,
                nodes: f.nodes.filter((n) => n.nodeId !== nodeId),
              }
            : f
        ),
        connections: state.project.connections.filter(
          (c) => c.from.nodeId !== nodeId && c.to.nodeId !== nodeId
        ),
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  // ─── CONNECTION MANAGEMENT ─────────────────────
  addConnection: (from, to, distance = 1, type = "hallway") =>
    set(async (state) => {
      get().pushToHistory();
      const newProject = {
        ...state.project,
        connections: [
          ...state.project.connections,
          {
            ...defaultConnection,
            from,
            to,
            distance,
            type,
          },
        ],
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  removeConnection: (fromId, toId) =>
    set(async (state) => {
      get().pushToHistory();
      const newProject = {
        ...state.project,
        connections: state.project.connections.filter(
          (c) =>
            !(
              c.from.nodeId === fromId &&
              c.to.nodeId === toId
            ) &&
            !(
              c.from.nodeId === toId &&
              c.to.nodeId === fromId
            )
        ),
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  // ─── META / RESET / IMPORT / EXPORT ─────────────
  updateMeta: (meta = {}) =>
    set(async (state) => {
      get().pushToHistory();
      const newProject = {
        ...state.project,
        building: {
          ...state.project.building,
          meta: {
            ...state.project.building.meta,
            ...meta,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      await saveState(newProject);
      return { project: newProject };
    }),

  resetProject: async () => {
    get().pushToHistory();
    const freshProject = {
      ...defaultProjectSchema,
      building: {
        ...defaultProjectSchema.building,
        id: crypto.randomUUID(),
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
    await saveState(freshProject);
    set({ project: freshProject });
  },

  exportProject: () => {
    const state = get().project;
    return JSON.stringify(state, null, 2);
  },

  importProject: async (jsonString) => {
    try {
      get().pushToHistory();
      const data = JSON.parse(jsonString);
      await saveState(data);
      set({ project: data });
    } catch (e) {
      console.error("Invalid JSON import:", e);
    }
  },
}));
