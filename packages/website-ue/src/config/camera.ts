import { degToRad } from "three/src/math/MathUtils.js";

export const fov = 20;

export const initialCameraR = 15;
export const initialCameraPhi = degToRad(90 - 10);
export const initialCameraTheta = degToRad(90 + 15);

export const cameraSwingVerticalAmplitude = degToRad(5);
export const cameraSwingVerticalFrequency = Math.E ** -6;
export const cameraSwingHorizontalAmplitude = degToRad(30);
export const cameraSwingHorizontalFrequency = Math.E ** -5;
