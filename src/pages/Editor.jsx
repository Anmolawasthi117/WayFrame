// src/pages/Editor.jsx
import { useState, useEffect } from "react";
import FloorManager from "../components/FloorManager/FloorManager";
import FloorCanvas from "../components/Canvas/FloorCanvas";
import Inspector from "../components/Inspector";
import { useProjectStore } from "../store/useProjectStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { Settings, HelpCircle, Maximize2, Minimize2 } from "lucide-react";

const Editor = () => {
  const project = useProjectStore((s) => s.project);
  const { saveState } = useHistoryStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Auto-save state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (project?.floors?.length > 0) {
        saveState();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [project, saveState]);

  // Keyboard shortcuts for the entire app
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveState();
            // Could add visual feedback here
            break;
          case '?':
            e.preventDefault();
            setShowHelp(true);
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveState, isFullscreen]);

  return (
    <div className={`flex h-screen w-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">Wayframe Editor</h1>
          <div className="text-sm text-gray-500">
            {project?.building?.name || "Untitled Project"}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Help & Shortcuts"
          >
            <HelpCircle size={16} />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-12">
        <FloorManager />
        <FloorCanvas />
        <Inspector />
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Help & Shortcuts</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Getting Started */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Getting Started</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Upload floor plan images using the Floor Manager</li>
                  <li>Double-click on the canvas to create nodes</li>
                  <li>Use Connect Mode (C) to link nodes together</li>
                  <li>Connect stairs/elevators between floors for multi-floor navigation</li>
                  <li>Export your project as JSON when complete</li>
                </ol>
              </div>

              {/* Canvas Shortcuts */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Canvas Controls</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Double-click</kbd>
                    <span className="ml-2 text-gray-600">Create new node</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Click</kbd>
                    <span className="ml-2 text-gray-600">Select node</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">C</kbd>
                    <span className="ml-2 text-gray-600">Toggle connect mode</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">M</kbd>
                    <span className="ml-2 text-gray-600">Toggle move mode</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Delete</kbd>
                    <span className="ml-2 text-gray-600">Remove selected node</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Escape</kbd>
                    <span className="ml-2 text-gray-600">Deselect & exit modes</span>
                  </div>
                </div>
              </div>

              {/* Global Shortcuts */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Global Shortcuts</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+Z</kbd>
                    <span className="ml-2 text-gray-600">Undo</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+Shift+Z</kbd>
                    <span className="ml-2 text-gray-600">Redo</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+S</kbd>
                    <span className="ml-2 text-gray-600">Save state</span>
                  </div>
                  <div>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+F</kbd>
                    <span className="ml-2 text-gray-600">Toggle fullscreen</span>
                  </div>
                </div>
              </div>

              {/* Node Types */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Node Types</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Room - Destination points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600">Hallway - Navigation paths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Stairs - Floor connections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Elevator - Vertical transport</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Pro Tips</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                  <li>Use stairs and elevators to connect nodes between different floors</li>
                  <li>The inspector panel shows connection counts and allows detailed editing</li>
                  <li>Export your project regularly to avoid losing work</li>
                  <li>Use the JSON editor for bulk changes or custom metadata</li>
                  <li>Node positions are stored as percentages for scalability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm">
        Auto-saving every 30s
      </div>
    </div>
  );
};

export default Editor;