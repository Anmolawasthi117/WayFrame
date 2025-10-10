// src/components/floorcanvas/FloorCanvas.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  MapContainer,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import FloorImage from "./FloorImage";
import Node from "./Node";
import Connections from "./Connections";
import Toolbar from "./Toolbar";
import ModeIndicator from "./ModeIndicator";
import Instructions from "./Instructions";
import NodeFormModal from "./NodeFormModal";

import { gridToMapCoords, mapToGridCoords, clampGridPoint } from "../../utils/transformCoords";
import { useProjectStore } from "../../store/useProjectStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { useUiStore } from "../../store/useUiStore";

// ---------- helper ----------
const MapClickHandler = ({ onMapDoubleClick }) => {
  useMapEvents({
    dblclick: (e) => onMapDoubleClick(e.latlng),
  });
  return null;
};

// ---------- main component ----------
const FloorCanvas = () => {
  const mapRef = useRef();

  // stores
  const {
    project,
    activeFloorId,
    addNode,
    updateNode,
    removeNode,
    addLocalConnection,
    selectedNodeId,
    addGlobalConnection,
  } = useProjectStore();

  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore();

  const { setSelectedNode } = useUiStore();

  // local UI state
  const [mode, setMode] = useState("select"); // select | move | connect
  const [modalData, setModalData] = useState(null);
  const [connectingNode, setConnectingNode] = useState(null);

  // floor and nodes
  const activeFloor = useMemo(
    () => project.floors.find((f) => f.id === activeFloorId),
    [project, activeFloorId]
  );

  const nodes = activeFloor?.nodes || [];

  const bounds = useMemo(() => [[0, 0], [activeFloor?.height || 1000, activeFloor?.width || 1000]], [activeFloor]);

  // ---------- handlers ----------

  const handleMapDoubleClick = (latlng) => {
    const grid = mapToGridCoords({ ...latlng, floor: activeFloor });
    setModalData({
      name: "",
      type: "room",
      coordinates: grid,
      floorId: activeFloor.id,
    });
  };

  const handleSaveNode = (formData) => {
    const newNode = {
      nodeId: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      coordinates: clampGridPoint(formData.coordinates, activeFloor.id),
      connections: [],
      floor: activeFloor.id,
    };
    addNode(activeFloor.id, newNode);
    saveState();
    setModalData(null);
  };

  const handleSelectNode = (node) => {
  if (mode === "connect") {
    if (!connectingNode) {
      setConnectingNode(node);
    } else if (connectingNode.nodeId !== node.nodeId) {
      // Same floor → local connection
      if (connectingNode.floor === node.floor) {
        addLocalConnection(node.floor, connectingNode.nodeId, node.nodeId);
      } else {
        // Different floors → global connection
        addGlobalConnection({
          from: connectingNode.nodeId,
          to: node.nodeId,
          type: "stair", // or elevator depending on node.type
          distance: 0,
        });
      }
      setConnectingNode(null);
      saveState();
    }
    return;
  }

  setSelectedNode(node.nodeId); // now correctly updates UI store
};

  const handleDragNode = (nodeId, latlng) => {
    if (mode !== "move") return;
    const grid = mapToGridCoords({ ...latlng, floor: activeFloor });
    updateNode(activeFloor.id, nodeId, {
      coordinates: clampGridPoint(grid, activeFloor.id),
    });
    saveState();
  };

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    removeNode(activeFloor.id, selectedNodeId);
    saveState();
  }, [selectedNodeId, activeFloor?.id]);

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Delete") handleDeleteNode();
      if (e.key.toLowerCase() === "c") setMode("connect");
      if (e.key.toLowerCase() === "m") setMode("move");
      if (e.ctrlKey && e.key.toLowerCase() === "z") undo();
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") redo();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleDeleteNode, undo, redo]);

  // ---------- render ----------
  if (!activeFloor)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No floor selected
      </div>
    );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        ref={mapRef}
        crs={L.CRS.Simple}
        bounds={bounds}
        minZoom={-4}
        maxZoom={5}
        zoom={-1}
        doubleClickZoom={false}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <FloorImage floor={activeFloor} />
        <MapClickHandler onMapDoubleClick={handleMapDoubleClick} />
        <Connections nodes={nodes} floor={activeFloor} />

        {nodes.map((node) => (
          <Node
            key={node.nodeId}
            node={node}
            mode={mode}
            floor={activeFloor}
            isSelected={selectedNodeId === node.nodeId}
            onSelect={handleSelectNode}
            onDrag={handleDragNode}
            globalConnections={project.connections}
          />
        ))}
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* UI */}
      <Toolbar
        mode={mode}
        setMode={setMode}
        undo={undo}
        redo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />
      <ModeIndicator mode={mode} />
      <Instructions />

      {/* modal */}
      {modalData && (
        <NodeFormModal
          nodeData={modalData}
          onSave={handleSaveNode}
          onCancel={() => setModalData(null)}
        />
      )}
    </div>
  );
};

export default FloorCanvas;
