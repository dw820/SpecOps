declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher, MOUSE, TOUCH, Vector3 } from 'three';

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);

    object: Camera;
    domElement: HTMLElement | HTMLDocument;

    // API
    enabled: boolean;
    target: Vector3;

    // rotation
    autoRotate: boolean;
    autoRotateSpeed: number;
    rotateSpeed: number;

    // zoom
    enableZoom: boolean;
    zoomSpeed: number;

    // panning
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;

    // damping
    enableDamping: boolean;
    dampingFactor: number;

    // limits
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    // current position
    getPolarAngle(): number;
    getAzimuthAngle(): number;

    // event listeners
    listenToKeyEvents(domElement: HTMLElement): void;

    // methods
    saveState(): void;
    reset(): void;
    update(): boolean;
    dispose(): void;
  }
}
