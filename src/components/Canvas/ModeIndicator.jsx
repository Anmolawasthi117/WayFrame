const ModeIndicator = ({ mode }) => {
  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm z-30">
      <span className="font-medium text-gray-700">
        Mode: <span className="capitalize text-blue-600">{mode}</span>
      </span>
    </div>
  );
};

export default ModeIndicator;