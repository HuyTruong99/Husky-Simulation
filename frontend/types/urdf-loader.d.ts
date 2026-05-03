declare module "urdf-loader" {
  import * as THREE from "three";

  export default class URDFLoader {
    load(path: string, onLoad: (robot: THREE.Object3D & { joints?: Record<string, { setAngle: (angle: number) => void }> }) => void): void;
  }
}
