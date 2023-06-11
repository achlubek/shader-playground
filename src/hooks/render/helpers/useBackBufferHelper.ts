import { useEffect, useMemo } from "react";

import * as THREE from "three";

import { UseBufferRendererBase } from "@app/hooks/render/useRender";

export interface UseBackBufferPropsBase extends UseBufferRendererBase {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
}

export interface BackBufferRenderCallParams {
  camera: THREE.Camera;
  scene: THREE.Scene;
  toneMapping?: THREE.ToneMapping | undefined;
}

export interface BackBuffer {
  getTarget(): THREE.WebGLRenderTarget;
  getBackBuffer(): THREE.WebGLRenderTarget;
  toggleState(): void;
}

export default function useBackBufferHelper(
  props: UseBackBufferPropsBase
): BackBuffer {
  const textures: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget] = useMemo(
    () => [
      new THREE.WebGLRenderTarget(props.width, props.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
      new THREE.WebGLRenderTarget(props.width, props.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    ],
    [props.width, props.height]
  );

  const currentState = {
    target: 0,
    back: 1,
  };
  const getTarget = (): THREE.WebGLRenderTarget =>
    textures[currentState.target];

  const getBackBuffer = (): THREE.WebGLRenderTarget =>
    textures[currentState.back];

  const toggleState = (): void => {
    currentState.back = currentState.back === 1 ? 0 : 1;
    currentState.target = currentState.target === 1 ? 0 : 1;
  };

  useEffect(() => {
    return () => {
      textures[0].dispose();
      textures[1].dispose();
    };
  }, [props.width, props.height]);

  return { getTarget, getBackBuffer, toggleState };
}
