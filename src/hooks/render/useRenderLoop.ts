import React, { useEffect } from "react";

export default function useRenderLoop(
  tick: () => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    let disposed = false;
    const renderLoop = (): void => {
      tick();

      if (!disposed) {
        requestAnimationFrame(() => renderLoop());
      }
    };
    requestAnimationFrame(() => renderLoop());

    return () => {
      disposed = true;
    };
  }, [tick, ...deps]);
}
