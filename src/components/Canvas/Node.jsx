import { CircleMarker, Tooltip, Marker } from "react-leaflet";
import { gridToMapCoords } from "../../utils/transformCoords";
import L from "leaflet";

const NODE_COLORS = {
  room: "#2563eb",      // blue
  hallway: "#10b981",   // green
  stair: "#f59e0b",     // amber
  elevator: "#8b5cf6",  // purple
};

const Node = ({
  node,
  floor,
  mode,
  isSelected,
  onSelect,
  onDrag,
  globalConnections = [],
}) => {
  if (!floor) return null;

  const { lat, lng } = gridToMapCoords({
    x: node.coordinates.x,
    y: node.coordinates.y,
    floor,
  });

  const handleClick = (e) => {
    e.originalEvent.stopPropagation();
    onSelect(node);
  };

  const handleDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    onDrag(node.nodeId, { lat, lng });
  };

  // local connections count
  const localCount = node.connections?.length || 0;

  // global connections count
  const globalCount = globalConnections.filter(
    (c) => c.from === node.nodeId || c.to === node.nodeId
  ).length;

  const fillColor = NODE_COLORS[node.type] || "#2563eb";

  // Draggable marker for move mode
  if (mode === "move") {
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width: ${isSelected ? 20 : 14}px;
        height: ${isSelected ? 20 : 14}px;
        background-color: ${fillColor};
        border: 2px solid ${isSelected ? "#ef4444" : "#000"};
        border-radius: 50%;
      "></div>`,
      iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
    });

    return (
      <Marker
        position={[lat, lng]}
        icon={icon}
        draggable
        eventHandlers={{
          dragend: handleDragEnd,
          click: handleClick,
        }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          <div className="relative text-xs font-medium text-gray-800 flex flex-col items-center">
            {node.name || "Unnamed"} <br />
            <span className="text-gray-500">{node.type}</span>
            <div className="flex gap-1 mt-1">
              {localCount > 0 && (
                <span className="bg-blue-500 text-white text-[10px] px-1 rounded-full">
                  {localCount}
                </span>
              )}
              {globalCount > 0 && (
                <span className="bg-green-500 text-white text-[10px] px-1 rounded-full">
                  {globalCount}
                </span>
              )}
            </div>
          </div>
        </Tooltip>
      </Marker>
    );
  }

  // Normal CircleMarker for select/connect modes
  return (
    <CircleMarker
      center={[lat, lng]}
      radius={isSelected ? 10 : 7}
      pathOptions={{
        color: mode === "connect" ? "#facc15" : isSelected ? "#ef4444" : fillColor,
        weight: 2,
        fillOpacity: 0.9,
      }}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -8]} opacity={1}>
        <div className="relative text-xs font-medium text-gray-800 flex flex-col items-center">
          {node.name || "Unnamed"} <br />
          <span className="text-gray-500">{node.type}</span>
          <div className="flex gap-1 mt-1">
            {localCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] px-1 rounded-full">
                {localCount}
              </span>
            )}
            {globalCount > 0 && (
              <span className="bg-green-500 text-white text-[10px] px-1 rounded-full">
                {globalCount}
              </span>
            )}
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
};

export default Node;
