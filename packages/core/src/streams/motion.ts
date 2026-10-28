import { times } from 'lodash-es';
import { ReadStream } from './buffer';

const HEADER_SIZE = 16;

export enum MotionChannel {
  Translation,
  Rotation,
  Scale,
}

export interface MotionKeys {
  times: number[];
  values: number[];
}

export interface Motion {
  duration: number;
  tracks: Map<string, Map<MotionChannel, MotionKeys>>;
}

export class MotionReadStream extends ReadStream {
  motion(): Motion {
    this.seek(HEADER_SIZE);

    const duration = this.float32();
    const tracks: Motion['tracks'] = new Map();

    times(this.uint32(), () => {
      const uid = this.paddedString();
      const channels = new Map<MotionChannel, MotionKeys>();

      this.paddedString();
      this.seek(4);

      times(this.uint32(), () => {
        const type = this.uint32() & 0xff;

        this.seek(4);

        const dimension = this.uint32() & 0xff;
        const keys: MotionKeys = { times: [], values: [] };

        times(this.uint32(), () => {
          keys.times.push(this.float32());
          times(dimension, () => keys.values.push(this.float32()));
        });
        channels.set(type, keys);
      });
      tracks.set(uid, channels);
    });

    return { duration, tracks };
  }

  paddedString() {
    const end = new Uint8Array(this.buffer).indexOf(0, this.index);
    const value = this.utf8(end - this.index);

    this.index = (end + 4) & ~3;

    return value;
  }
}
