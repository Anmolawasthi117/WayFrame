/**
 * Convert grid coordinates (0–100) to Leaflet CRS.Simple coordinates (pixels)
 * for a specific floor with dynamic width/height.
 *
 * The Y axis is flipped to match image coordinates (bottom = 0 → top = 100).
 */
export const gridToMapCoords = ({ x, y, floor }) => {
  if (!floor?.width || !floor?.height)
    throw new Error("Missing floor dimensions in gridToMapCoords");

  return {
    lng: (x / 100) * floor.width,
    lat: ((100 - y) / 100) * floor.height,
  };
};

/**
 * Convert Leaflet CRS.Simple coordinates (pixels) back to grid coordinates (0–100)
 * using dynamic floor dimensions.
 *
 * This ensures that user clicks and drags on any map size still translate correctly.
 */
export const mapToGridCoords = ({ lat, lng, floor }) => {
  if (!floor?.width || !floor?.height)
    throw new Error("Missing floor dimensions in mapToGridCoords");

  const x = (lng / floor.width) * 100;
  const y = (1 - lat / floor.height) * 100;

  return {
    x: parseFloat(x.toFixed(2)),
    y: parseFloat(y.toFixed(2)),
  };
};

/**
 * Clamp a grid point to stay inside [0, 100] boundaries.
 */
export const clampGridPoint = (pt, floor) => ({
  x: Math.max(0, Math.min(pt.x, 100)),
  y: Math.max(0, Math.min(pt.y, 100)),
  floor,
});
