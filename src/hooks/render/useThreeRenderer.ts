import { useEffect, useMemo } from "react";

import * as THREE from "three";
import { NoToneMapping } from "three";

export default function useThreeRenderer(): THREE.WebGLRenderer {
  const renderer = useMemo(() => {
    const threeRenderer = new THREE.WebGLRenderer({
      depth: true,
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
      stencil: false,
    });
    threeRenderer.toneMapping = NoToneMapping;
    return threeRenderer;
  }, []);

  useEffect(() => {
    return () => {
      renderer.dispose();
    };
  }, []);

  return renderer;
}
