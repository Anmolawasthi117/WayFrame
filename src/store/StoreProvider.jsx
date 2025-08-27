import { useEffect, useState } from "react";
import { useProjectStore } from "./useProjectStore";

export default function StoreProvider({ children }) {
  const init = useProjectStore((state) => state.init);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      await init(); // hydrate from IndexedDB/localStorage
      setHydrated(true);
    })();
  }, [init]);

  if (!hydrated) {
    return <div className="w-full h-full flex items-center justify-center">
      <p>Loading project data...</p>
    </div>;
  }

  return children;
}
