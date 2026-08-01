import { Vector3Tuple } from "three";

export interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
  collision: {
    [key: string]: {
      points: Vector3Tuple;
      bbox: {
        min: Vector3Tuple;
        max: Vector3Tuple;
      };
      averageThickness?: Record<string, number>;
    };
  };
  maskSlice?: {
    [key: string]:
      | {
          enabled: boolean;
          planePosition: Vector3Tuple;
          planeNormal: Vector3Tuple;
          planeAxis: Vector3Tuple;
          frustumConeBaseRadius: number;
          frustumConeAngleDegrees: number;
          planeSliceMode: number;
          frustumConeSliceMode: number;
        }
      | undefined;
  };
}
