import * as THREE from "three";
import { Vector4 } from "three";

import { renderToTarget } from "@app/util/renderToTarget";

export interface UseBufferRendererBase {
  renderer: THREE.WebGLRenderer;
}

export interface BufferRenderCallParams {
  camera: THREE.Camera;
  scene: THREE.Scene;
  target: THREE.WebGLRenderTarget | THREE.WebGLMultipleRenderTargets | null;
  viewport?: Vector4 | undefined;
  toneMapping?: THREE.ToneMapping | undefined;
}

export type Render = (params: BufferRenderCallParams) => void;

export default function useRender(props: UseBufferRendererBase): Render {
  const render = (params: BufferRenderCallParams): void => {
    renderToTarget({
      ...props,
      ...params,
    });
  };

  return render;
}
