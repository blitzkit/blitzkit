import { SmartCanvas } from '../../../../../../../SmartCanvas';
import { CameraPositioner, zoom } from './CameraPositioner';
import { CanvasContent } from './CanvasContent';

export function FlexibilityCanvas() {
  return (
    <SmartCanvas orthographic camera={{ zoom, rotation: [0, Math.PI / 2, 0] }}>
      <CanvasContent />
      <CameraPositioner />
    </SmartCanvas>
  );
}
