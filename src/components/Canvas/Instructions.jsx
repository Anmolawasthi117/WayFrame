const Instructions = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg text-sm text-gray-600 max-w-sm">
      <h4 className="font-semibold mb-2">Quick Guide</h4>
      <div className="space-y-1 text-xs">
        <p><kbd className="bg-gray-100 px-1 rounded">Double-click</kbd> Add node</p>
        <p><kbd className="bg-gray-100 px-1 rounded">Click</kbd> Select node</p>
        <p><kbd className="bg-gray-100 px-1 rounded">C</kbd> Toggle connect mode</p>
        <p><kbd className="bg-gray-100 px-1 rounded">M</kbd> Toggle move mode</p>
        <p><kbd className="bg-gray-100 px-1 rounded">Del</kbd> Remove selected</p>
        <p><kbd className="bg-gray-100 px-1 rounded">Ctrl+Z</kbd> Undo</p>
        <p><kbd className="bg-gray-100 px-1 rounded">Scroll</kbd> Zoom in/out</p>
        <p><kbd className="bg-gray-100 px-1 rounded">Drag background</kbd> Pan around</p>
      </div>
    </div>
  );
};

export default Instructions;
