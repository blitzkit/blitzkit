import type { QuicklimeEvent } from 'quicklime';
import { useEffect, useRef } from 'react';
import type { Group } from 'three';
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from '../../../../../../../../core/blitzkit/modelTransform';
import { ModelChunk } from './ModelChunk';

export function CanvasContent() {
  const hull = useRef<Group>(null);
  const gun = useRef<Group>(null);

  useEffect(() => {
    function handleModelTransformEvent(
      event: QuicklimeEvent<ModelTransformEventData>,
    ) {
      if (!gun.current) return;

      gun.current.rotation.x = event.data.pitch;
    }

    modelTransformEvent.on(handleModelTransformEvent);

    return () => {
      modelTransformEvent.off(handleModelTransformEvent);
    };
  }, []);

  return (
    <>
      <group ref={hull}>
        <ModelChunk />
      </group>

      <group ref={gun}>
        <ModelChunk onlyGun />
      </group>
    </>
  );
}
