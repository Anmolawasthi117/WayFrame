// src/components/NodeForm.jsx
import { useState, useEffect } from "react";
import { defaultNode } from "../utils/defaultSchema";
import { useSchemaStore } from "../store/useSchemaStore";

export default function NodeForm({ nodeId, onClose }) {
  const { schema, updateSchema } = useSchemaStore();
  const [formData, setFormData] = useState(defaultNode);

  // If editing existing node
  useEffect(() => {
    if (nodeId) {
      const floor = schema.floors[0]; // assuming single floor for now
      const existing = floor.nodes.find((n) => n.nodeId === nodeId);
      if (existing) setFormData(existing);
    }
  }, [nodeId, schema]);

  // Handle input change dynamically
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedChange = (parent, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedFloors = schema.floors.map((floor) => {
      let nodes = [...(floor.nodes || [])];
      const existingIndex = nodes.findIndex((n) => n.nodeId === formData.nodeId);

      if (existingIndex >= 0) {
        // update existing
        nodes[existingIndex] = formData;
      } else {
        // new node
        nodes.push({ ...formData, nodeId: crypto.randomUUID() });
      }

      return { ...floor, nodes };
    });

    updateSchema({ floors: updatedFloors });
    onClose?.();
  };

  const handleDelete = () => {
    const updatedFloors = schema.floors.map((floor) => ({
      ...floor,
      nodes: floor.nodes.filter((n) => n.nodeId !== formData.nodeId),
    }));
    updateSchema({ floors: updatedFloors });
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 flex flex-col gap-3 bg-white rounded-xl shadow-md"
    >
      <h2 className="text-lg font-semibold">
        {nodeId ? "Edit Node" : "Create Node"}
      </h2>

      {/* Basic string fields */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        className="border p-2 rounded"
      />

      {/* Select Type */}
      <select
        value={formData.type}
        onChange={(e) => handleChange("type", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="room">Room</option>
        <option value="hallway">Hallway</option>
        <option value="stair">Stair</option>
        <option value="elevator">Elevator</option>
      </select>

      {/* Coordinates */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="X"
          value={formData.coordinates.x}
          onChange={(e) =>
            handleNestedChange("coordinates", "x", Number(e.target.value))
          }
          className="border p-2 rounded w-1/3"
        />
        <input
          type="number"
          placeholder="Y"
          value={formData.coordinates.y}
          onChange={(e) =>
            handleNestedChange("coordinates", "y", Number(e.target.value))
          }
          className="border p-2 rounded w-1/3"
        />
        <input
          type="number"
          placeholder="Floor"
          value={formData.coordinates.floor}
          onChange={(e) =>
            handleNestedChange("coordinates", "floor", Number(e.target.value))
          }
          className="border p-2 rounded w-1/3"
        />
      </div>

      {/* Meta (key-value) */}
      <textarea
        placeholder="Meta JSON"
        value={JSON.stringify(formData.meta, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            handleChange("meta", parsed);
          } catch {
            // ignore invalid JSON
          }
        }}
        className="border p-2 rounded font-mono text-sm"
      />

      <div className="flex justify-between mt-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
        {nodeId && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
