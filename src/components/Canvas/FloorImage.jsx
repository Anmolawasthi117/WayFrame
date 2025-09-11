import { Plus } from "lucide-react";

const FloorImage = ({ activeFloor }) => {
  return activeFloor?.imageUrl ? (
    <img
      src={activeFloor.imageUrl}
      alt={activeFloor.name}
      className="w-full h-full object-contain select-none pointer-events-none"
      draggable={false}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-white">
      <div className="text-center">
        <Plus size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No floor image uploaded</p>
        <p className="text-sm mt-2">Double-click to add nodes</p>
      </div>
    </div>
  );
};

export default FloorImage;