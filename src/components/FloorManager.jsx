import { useFloorStore } from "../store/floors";

const FloorManager = () => {
  const { floors, activeFloorId, addFloor, removeFloor, setActiveFloor } =
    useFloorStore();

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) addFloor(file);
  };

  return (
    <div className="w-64 bg-white shadow-md p-4 flex flex-col gap-3">
      <h2 className="font-bold text-lg">Floors</h2>

      {/* Upload */}
      <label className="cursor-pointer bg-blue-500 text-white text-sm py-1 px-2 rounded text-center">
        Upload Floor
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
      </label>

      {/* Floor List */}
      <div className="flex flex-col gap-2">
        {floors.map((f) => (
          <div
            key={f.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              f.id === activeFloorId ? "bg-blue-100" : "bg-gray-100"
            }`}
            onClick={() => setActiveFloor(f.id)}
          >
            <span className="truncate">{f.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFloor(f.id);
              }}
              className="text-red-500 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorManager;
