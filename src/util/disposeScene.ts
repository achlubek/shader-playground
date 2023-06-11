import * as THREE from "three";

export function disposeObject3d(o3d: object | null): void {
  if (o3d === null) {
    return;
  }
  const disposeIfPossible = (target: object | null): void => {
    if (target === null) {
      return;
    }
    const v = target as {
      dispose: unknown;
      userData?: { noDispose?: boolean; disposed?: boolean };
      name?: string;
    };
    if (
      v.dispose &&
      typeof v.dispose === "function" &&
      !v.userData?.noDispose &&
      !v.userData?.disposed
    ) {
      v.dispose();
      if (!v.userData) {
        v.userData = { disposed: true };
      }
      v.userData.disposed = true;
      // // eslint-disable-next-line no-console
      // console.log(
      //   `Disposed ${v.constructor.name} with name "${v.name ?? "undefined"}"`
      // );
    }
  };
  Object.keys(o3d).forEach((key) => {
    const v = o3d[key] as unknown | unknown[];
    if (key === "uniforms") {
      return; // dont dispose by bound uniforms... i think this is getting out of hand
    }
    if (Array.isArray(v)) {
      v.map((a) => {
        disposeIfPossible(a as object);
      });
    }
    if (typeof v === "object" && v !== o3d) {
      if (v instanceof THREE.Scene) {
        //disposeScene(v);
      } else {
        disposeObject3d(v);
      }
      disposeIfPossible(v);
    }
  });
}

export function disposeScene(scene: THREE.Scene): void {
  scene.children.forEach((c) => {
    if (!c.userData.noDispose) {
      if (c instanceof THREE.Scene) {
        disposeScene(c);
      } else {
        disposeObject3d(c);
      }
    }
  });
  scene.clear();
}
