import {
  ACESFilmicToneMapping,
  Camera,
  Scene,
  ToneMapping,
  WebGLRenderer,
} from "three";

import useCanvas, { Canvas } from "@app/hooks/render/useCanvas";
import useRender, { Render } from "@app/hooks/render/useRender";
import useRenderLoop from "@app/hooks/render/useRenderLoop";
import useThreeRenderer from "@app/hooks/render/useThreeRenderer";
import { updateCameraAspectRatio } from "@app/util/updateCameraAspectRatio";

export interface UseCanvasRenderLoopHelperProps {
  className?: string | undefined;
  scene: Scene;
  camera: Camera;
  autoCorrectAspect: boolean;
  toneMapping?: ToneMapping | undefined;
  onRender?: (() => void) | undefined;
}

export interface CanvasRenderLoopHelper {
  renderer: WebGLRenderer;
  render: Render;
  canvas: Canvas;
}

export default function useCanvasRenderLoopHelper(
  props: UseCanvasRenderLoopHelperProps
): CanvasRenderLoopHelper {
  const renderer = useThreeRenderer();

  const render = useRender({
    renderer,
  });

  const canvas = useCanvas({
    renderer,
    elementClassName: props.className,
    onResize: () => {
      if (props.autoCorrectAspect && canvas.overlayRef.current) {
        updateCameraAspectRatio(props.camera, canvas.overlayRef.current);
      }
    },
  });

  useRenderLoop(() => {
    canvas.update();

    if (props.onRender) {
      props.onRender();
    }

    render({
      scene: props.scene,
      camera: props.camera,
      toneMapping: props.toneMapping ?? ACESFilmicToneMapping,
      target: null,
    });
  }, [
    props.camera,
    props.scene,
    canvas,
    canvas.overlayRef,
    canvas.overlayRef.current,
  ]);

  return { canvas, render, renderer };
}
