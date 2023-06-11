import {
  Camera,
  Scene,
  ToneMapping,
  Vector2,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import * as THREE from "three";

export const renderToTarget = (props: {
  renderer: WebGLRenderer;
  target: WebGLRenderTarget | THREE.WebGLMultipleRenderTargets | null;
  camera: Camera;
  scene: Scene;
  toneMapping?: ToneMapping | undefined;
  viewport?: Vector4 | undefined;
}): void => {
  const oldRenderTarget = props.renderer.getRenderTarget();
  const oldViewport = props.renderer.getViewport(new Vector4());
  const oldToneMapping = props.renderer.toneMapping;

  props.renderer.setRenderTarget(props.target);
  const size = props.renderer.getSize(new Vector2());
  if (props.target === null) {
    props.renderer.setViewport(0, 0, size.x, size.y);
  } else if (props.target instanceof WebGLRenderTarget) {
    props.renderer.setViewport(
      props.viewport ? props.viewport.x : 0,
      props.viewport ? props.viewport.y : 0,
      props.viewport ? props.viewport.width : props.target.width,
      props.viewport ? props.viewport.height : props.target.height
    );
  } else {
    if (!props.viewport) {
      throw new Error("No viewport specified in multi target rendering");
    }
    props.renderer.setViewport(props.viewport);
  }
  props.renderer.toneMapping = props.toneMapping ?? oldToneMapping;

  props.renderer.render(props.scene, props.camera);

  props.renderer.setRenderTarget(oldRenderTarget);
  props.renderer.setViewport(oldViewport);
  props.renderer.toneMapping = oldToneMapping;
};
