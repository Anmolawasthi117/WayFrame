import { useFloorStore } from "../store/floors";

const FloorCanvas = () => {
  const { floors, activeFloorId } = useFloorStore();
  const activeFloor = floors.find((f) => f.id === activeFloorId);

  if (!activeFloor) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Upload a floor to get started
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <img
        src={activeFloor.imageUrl}
        alt={activeFloor.name}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export default FloorCanvas;
