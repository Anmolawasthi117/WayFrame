import { useRef, useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useFloorStore } from "../store/useFloorStore";
import { Plus, Check, Pencil, Trash } from "lucide-react";

// helper: file → base64 string
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // base64 data URL
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

const FloorManager = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const setActiveFloor = useProjectStore((s) => s.setActiveFloor);
  const { addFloor, updateFloor, removeFloor } = useFloorStore();

  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleUpload = async (file) => {
    const base64 = await toBase64(file); // convert image to base64
    const name = file.name.replace(/\.[^/.]+$/, "");

    await addFloor({
      name,
      level: project.floors.length,
      imageUrl: base64, // persist-safe
    });
  };

  return (
    <div className="p-3 space-y-3">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
      />

      {/* Add floor button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
      >
        <Plus size={16} /> Add Floor
      </button>

      {/* Floors list */}
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {project.floors.map((f) => (
          <div
            key={f.id}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition ${
              f.id === activeFloorId
                ? "bg-blue-500 text-white font-medium shadow"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {editingId === f.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  updateFloor(f.id, { name: editName });
                  setEditingId(null);
                }}
                autoFocus
                className="flex-1 bg-white text-gray-800 px-2 py-1 rounded"
              />
            ) : (
              <button
                className="flex-1 text-left truncate"
                onClick={() => setActiveFloor(f.id)}
              >
                {f.name}
              </button>
            )}

            <div className="flex items-center gap-2 ml-2">
              {f.id === activeFloorId && <Check size={16} />}
              <button
                onClick={() => {
                  setEditingId(f.id);
                  setEditName(f.name);
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => removeFloor(f.id)}
                className="p-1 hover:bg-red-200 rounded text-red-600"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorManager;
