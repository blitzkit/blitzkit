import { Quicklime } from 'quicklime';

export interface ModelTransformEventData {
  yaw: number;
  pitch: number;
}

export const modelTransformEvent = new Quicklime<ModelTransformEventData>({
  pitch: 0,
  yaw: 0,
});
