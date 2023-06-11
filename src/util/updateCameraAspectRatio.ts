import { Camera, PerspectiveCamera } from "three";

export const updateCameraAspectRatio = (
  camera: Camera,
  element: HTMLElement
): void => {
  if (camera instanceof PerspectiveCamera) {
    const aspect = element.clientWidth / element.clientHeight;
    if (camera.aspect !== aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  }
};
