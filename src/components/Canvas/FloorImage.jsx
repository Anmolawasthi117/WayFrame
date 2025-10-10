// src/components/floorcanvas/FloorImage.jsx
import { ImageOverlay } from "react-leaflet";

const FloorImage = ({ floor }) => {
  if (!floor?.imageUrl) return null;

  const bounds = [
    [0, 0],
    [floor.height, floor.width],
  ];

  return (
    <ImageOverlay
      url={floor.imageUrl}
      bounds={bounds}
      className="select-none"
      interactive={false}
    />
  );
};

export default FloorImage;
