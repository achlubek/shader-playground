import * as THREE from "three";
import { Vector4 } from "three";

import useFullScreenShaderPassHelper from "@app/hooks/render/helpers/useFullScreenShaderPassHelper";
import { Render } from "@app/hooks/render/useRender";

export interface TextureOutputRendererProps {
  texture: THREE.Texture;
  render: Render;
}

export interface TextureOutputRendererRenderCallParams {
  target: THREE.WebGLRenderTarget | THREE.WebGLMultipleRenderTargets | null;
  viewport?: Vector4 | undefined;
}

export interface TextureOutputRenderer {
  camera: THREE.Camera;
  scene: THREE.Scene;
  setTexture: (texture: THREE.Texture) => void;
}

export default function useTextureOutputHelper(
  props: TextureOutputRendererProps
): TextureOutputRenderer {
  const fragmentShader = `
    varying vec2 UV;
    uniform sampler2D tex;
    void main() { gl_FragColor = texture(tex, UV); } `;

  const { scene, camera, setUniforms } = useFullScreenShaderPassHelper({
    fragmentShader,
    uniforms: {
      tex: {
        value: props.texture,
      },
    },
  });

  return {
    camera,
    scene,
    setTexture: (texture: THREE.Texture) =>
      setUniforms({
        tex: {
          value: texture,
        },
      }),
  };
}
