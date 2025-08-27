import FloorManager from "../components/FloorManager";
import FloorCanvas from "../components/FloorCanvas";

const Editor = () => {
  return (
    <div className="flex h-screen w-screen">
      <FloorManager />
      <FloorCanvas />
    </div>
  );
};

export default Editor;
