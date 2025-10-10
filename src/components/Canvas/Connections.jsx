// src/components/floorcanvas/Connections.jsx
import { Polyline } from "react-leaflet";
import { gridToMapCoords } from "../../utils/transformCoords";

const Connections = ({ nodes = [], floor }) => {
  const lines = [];

  nodes.forEach((node) => {
    node.connections?.forEach(({ nodeId: targetId }) => {
      const target = nodes.find((n) => n.nodeId === targetId);
      if (!target) return; // skip if target is not on this floor

      // avoid drawing duplicate lines
      const key = [node.nodeId, target.nodeId].sort().join("-");
      if (lines.some((l) => l.key === key)) return;

      const a = gridToMapCoords({ ...node.coordinates, floor });
      const b = gridToMapCoords({ ...target.coordinates, floor });

      lines.push({
        key,
        positions: [
          [a.lat, a.lng],
          [b.lat, b.lng],
        ],
      });
    });
  });

  return (
    <>
      {lines.map((line) => (
        <Polyline
          key={line.key}
          positions={line.positions}
          pathOptions={{
            color: "black",
            weight: 2,
            opacity: 0.8,
          }}
        />
      ))}
    </>
  );
};

export default Connections;
