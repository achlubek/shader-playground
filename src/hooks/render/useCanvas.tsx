import React, { ReactElement, useEffect, useMemo, useRef } from "react";

import * as THREE from "three";
import { Vector2, Vector3 } from "three";

interface CanvasPosition {
  x: number;
  y: number;
}

export interface UseCanvasEvents {
  onResize?: ((width: number, height: number) => void) | undefined;
}

export interface UseCanvasProps extends UseCanvasEvents {
  elementClassName?: string | undefined;
  renderer: THREE.WebGLRenderer;
  elementProps?:
    | React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >
    | undefined;
}

export interface Canvas {
  update: () => void;
  element: ReactElement;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  raycast: (
    camera: THREE.Camera,
    scene: THREE.Scene,
    clientX: number,
    clientY: number
  ) => { direction: Vector3; intersections: THREE.Intersection[] };
}

export default function useCanvas(props: UseCanvasProps): Canvas {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    if (overlayRef.current) {
      const threeRenderer = props.renderer;
      threeRenderer.setSize(
        overlayRef.current.clientWidth,
        overlayRef.current.clientHeight
      );
      overlayRef.current.replaceChildren(threeRenderer.domElement);
      if (props.onResize) {
        props.onResize(
          overlayRef.current.clientWidth,
          overlayRef.current.clientHeight
        );
      }
    }
  }, [overlayRef, overlayRef.current]);

  const calculateNormalizedMouseCoords = (
    clientX: number,
    clientY: number
  ): CanvasPosition => {
    const bbox = props.renderer.domElement.getBoundingClientRect();
    const xAbs = clientX - bbox.left;
    const yAbs = clientY - bbox.top;
    const xNorm = xAbs / bbox.width;
    const yNorm = yAbs / bbox.height;
    return { x: xNorm, y: yNorm };
  };

  const calculateNDCMouseCoords = (
    normalized: CanvasPosition
  ): THREE.Vector2 => {
    const xSnorm = normalized.x * 2 - 1;
    const ySnorm = -normalized.y * 2 + 1;
    return new THREE.Vector2(xSnorm, ySnorm);
  };

  const raycast = (
    camera: THREE.Camera,
    scene: THREE.Scene,
    clientX: number,
    clientY: number
  ): { direction: Vector3; intersections: THREE.Intersection[] } => {
    const position = calculateNDCMouseCoords(
      calculateNormalizedMouseCoords(clientX, clientY)
    );
    raycaster.setFromCamera(position, camera);
    return {
      direction: raycaster.ray.direction,
      intersections: raycaster.intersectObjects(scene.children),
    };
  };

  const update = (): void => {
    let size = new Vector2(0, 0);
    size = props.renderer.getSize(size);
    if (
      overlayRef.current &&
      (size.x !== overlayRef.current.clientWidth ||
        size.y !== overlayRef.current.clientHeight)
    ) {
      props.renderer.setSize(
        overlayRef.current.clientWidth,
        overlayRef.current.clientHeight
      );
      if (props.onResize) {
        props.onResize(
          overlayRef.current.clientWidth,
          overlayRef.current.clientHeight
        );
      }
    }
  };

  const element = (
    <div
      {...props.elementProps}
      ref={overlayRef}
      className={props.elementClassName}
      style={{
        overflow: "hidden",
        position: "relative",
        ...props.elementProps?.style,
      }}
    />
  );

  return { update, raycast, element, overlayRef };
}
