import { useProjectStore } from "../store/useProjectStore";

const Inspector = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const setProject = useProjectStore((s) => s.setProject);

  const activeFloor = project.floors.find((f) => f.id === activeFloorId);

  if (!activeFloor) {
    return (
      <div className="p-4 text-gray-500">
        Select a floor to view details
      </div>
    );
  }

  const handleChange = (e) => {
    const updatedFloors = project.floors.map((f) =>
      f.id === activeFloor.id ? { ...f, name: e.target.value } : f
    );
    setProject({ ...project, floors: updatedFloors });
  };

  return (
    <div className="p-4 space-y-2 border-l bg-gray-50">
      <h2 className="font-semibold">Inspector</h2>
      <label className="block">
        <span className="text-sm text-gray-600">Floor Name</span>
        <input
          type="text"
          value={activeFloor.name}
          onChange={handleChange}
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </label>
    </div>
  );
};

export default Inspector;
