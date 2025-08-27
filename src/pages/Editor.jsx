// src/pages/Editor.jsx
import FloorManager from "../components/FloorManager";
import FloorCanvas from "../components/FloorCanvas";
import Inspector from "../components/Inspector";

const Editor = () => {
  return (
    <div className="flex h-screen w-screen">
      <FloorManager />
      <FloorCanvas />
      <Inspector /> 
    </div>
  );
};

export default Editor;
