import { literals } from "@blitzkit/i18n";
import { AngleIcon, WidthIcon } from "@radix-ui/react-icons";
import { Code, Flex, Slider } from "@radix-ui/themes";
import type { QuicklimeEvent } from "quicklime";
import { useCallback, useEffect, useState } from "react";
import { radToDeg } from "three/src/math/MathUtils.js";
import { useLocale } from "../../../../../../../../hooks/useLocale";
import {
  distanceToFov,
  fovToDistance,
  zoomEvent,
  type ZoomEventData,
} from "../../../../TankSandbox/components/Control";
import {
  MAX_ZOOM_DISTANCE,
  MIN_ZOOM_DISTANCE,
} from "../../../../TankSandbox/components/SceneProps";

export function ZoomControls() {
  const [distance, setDistance] = useState(zoomEvent.last!.distance);
  const [fov, setFov] = useState(zoomEvent.last!.fov);
  const { strings } = useLocale();

  const handleDistanceChange = useCallback(([value]: number[]) => {
    const newFov = distanceToFov(
      zoomEvent.last!.height,
      zoomEvent.last!.padding,
      value,
    );

    zoomEvent.dispatch({ ...zoomEvent.last!, distance: value, fov: newFov });
  }, []);
  const handleFovChange = useCallback(([value]: number[]) => {
    const newDistance = fovToDistance(
      zoomEvent.last!.height,
      zoomEvent.last!.padding,
      value,
    );

    zoomEvent.dispatch({
      ...zoomEvent.last!,
      distance: newDistance,
      fov: value,
    });
  }, []);

  useEffect(() => {
    function handleZoom(event: QuicklimeEvent<ZoomEventData>) {
      setDistance(event.data.distance);
      setFov(event.data.fov);
    }

    zoomEvent.on(handleZoom);

    return () => {
      zoomEvent.off(handleZoom);
    };
  }, []);

  return (
    <Flex
      align="start"
      position="absolute"
      left="4"
      top="50%"
      height="100%"
      maxHeight="10rem"
      style={{ transform: "translateY(-50%)" }}
      direction="column"
      gap="4"
    >
      <Flex direction="column">
        <Code variant="ghost" color="gray">
          <Flex align="center" gap="1">
            <WidthIcon />
            {literals(strings.common.units.m, { value: distance.toFixed(0) })}
          </Flex>
        </Code>

        <Code variant="ghost" color="gray">
          <Flex align="center" gap="1">
            <AngleIcon />
            {literals(strings.common.units.deg, {
              value: radToDeg(fov).toFixed(0),
            })}
          </Flex>
        </Code>
      </Flex>

      <Flex gap="3" flexGrow="1">
        <Slider
          color="gray"
          size="1"
          orientation="vertical"
          value={[distance]}
          min={MIN_ZOOM_DISTANCE}
          max={MAX_ZOOM_DISTANCE}
          onValueChange={handleDistanceChange}
          step={Number.EPSILON}
        />
        <Slider
          color="gray"
          size="1"
          orientation="vertical"
          value={[fov]}
          min={distanceToFov(
            zoomEvent.last!.height,
            zoomEvent.last!.padding,
            MAX_ZOOM_DISTANCE,
          )}
          max={distanceToFov(
            zoomEvent.last!.height,
            zoomEvent.last!.padding,
            MIN_ZOOM_DISTANCE,
          )}
          onValueChange={handleFovChange}
          step={Number.EPSILON}
        />
      </Flex>
    </Flex>
  );
}
