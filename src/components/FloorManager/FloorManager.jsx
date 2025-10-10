import { useState, useCallback } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { FloorUpload } from "./FloorUpload";
import { FloorList } from "./FloorList";
import { FloorStats } from "./FloorStats";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

const getImageDimensions = (base64) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = base64;
  });

const FloorManager = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const setActiveFloor = useProjectStore((s) => s.setActiveFloor);
  const addFloor = useProjectStore((s) => s.addFloor);
  const updateFloor = useProjectStore((s) => s.updateFloor);
  const removeFloor = useProjectStore((s) => s.removeFloor);

  const { saveState } = useHistoryStore();

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);
      saveState();

      try {
        let lastAddedFloorId = null;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const base64 = await toBase64(file);
          const name = file.name.replace(/\.[^/.]+$/, "");

          // Dynamically get image dimensions
          const { width, height } = await getImageDimensions(base64);

          const newFloor = {
            name,
            level: project.floors.length + i,
            imageUrl: base64,
            width,       // store dynamic width
            height,      // store dynamic height
            id: crypto.randomUUID(),
          };

          addFloor(newFloor);
          lastAddedFloorId = newFloor.id;
        }

        if (lastAddedFloorId) {
          setActiveFloor(lastAddedFloorId);
        }
      } catch (error) {
        console.error("Error uploading floors:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [addFloor, project.floors.length, saveState, setActiveFloor]
  );

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files) {
        handleUpload(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) handleUpload(files);
    },
    [handleUpload]
  );

  const handleFloorDelete = useCallback(
    (floorId, floorName) => {
      const hasNodes = project.floors.find((f) => f.id === floorId)?.nodes?.length || 0;
      const message = hasNodes
        ? `Delete floor "${floorName}" and all its ${hasNodes} nodes?`
        : `Delete floor "${floorName}"?`;

      if (window.confirm(message)) {
        saveState();
        removeFloor(floorId);
      }
    },
    [project.floors, saveState, removeFloor]
  );

  const handleFloorEdit = useCallback((floor) => {
    setEditingId(floor.id);
    setEditName(floor.name);
  }, []);

  const handleFloorUpdate = useCallback(
    (floorId, name) => {
      if (name.trim()) {
        saveState();
        updateFloor(floorId, { name: name.trim() });
      }
      setEditingId(null);
    },
    [saveState, updateFloor]
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="font-bold text-gray-800 text-lg mb-3">Floor Manager</h2>
        <FloorUpload
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      </div>

      {/* Floors list */}
      <div className="flex-1 p-3 overflow-y-auto">
        <FloorList
          floors={project.floors}
          activeFloorId={activeFloorId}
          editingId={editingId}
          editName={editName}
          onEditNameChange={setEditName}
          onFloorClick={setActiveFloor}
          onEdit={handleFloorEdit}
          onUpdate={handleFloorUpdate}
          onDelete={handleFloorDelete}
          setEditingId={setEditingId}
          project={project}
        />
      </div>

      {/* Footer */}
      <FloorStats
        totalFloors={project.floors.length}
        totalNodes={project.floors.reduce((acc, f) => acc + (f.nodes?.length || 0), 0)}
        totalConnections={project.connections?.length || 0}
      />
    </div>
  );
};

export default FloorManager;
