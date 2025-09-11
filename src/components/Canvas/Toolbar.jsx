import { Move, Link } from "lucide-react";

const Toolbar = ({ mode, setMode, canUndo, canRedo, undo, redo }) => {
  return (
    <div className="absolute top-4 left-4 flex gap-2 z-30">
      <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
        <button
          onClick={() => setMode("select")}
          className={`p-2 rounded-md text-sm font-medium transition-all ${
            mode === "select" 
              ? "bg-blue-500 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Select Mode (Default)"
        >
          <Move size={16} />
        </button>
        <button
          onClick={() => setMode("connect")}
          className={`p-2 rounded-md text-sm font-medium transition-all ${
            mode === "connect" 
              ? "bg-yellow-500 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Connect Mode (C)"
        >
          <Link size={16} />
        </button>
        <button
          onClick={() => setMode("move")}
          className={`p-2 rounded-md text-sm font-medium transition-all ${
            mode === "move" 
              ? "bg-green-500 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Move Mode (M)"
        >
          <Move size={16} />
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </button>
      </div>
    </div>
  );
};

export default Toolbar;