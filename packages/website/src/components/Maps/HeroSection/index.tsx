import { Box, Flex } from "@radix-ui/themes";
import { api } from "../../../core/blitzkit/api";
import { useFullScreen } from "../../../hooks/useFullScreen";
import { useLocale } from "../../../hooks/useLocale";
import { Maps } from "../../../stores/maps";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";
import { ControlTips } from "./components/ControlTips";
import { MapSandbox } from "./components/MapSandbox";
import { Title } from "./components/MapSandbox/Title";
import { MapSandboxLoader } from "./components/MapSandboxLoader";
import { Options } from "./components/Options";

const mapDefinitions = await api.mapDefinitions();

export function HeroSection({ skeleton }: MaybeSkeletonComponentProps) {
  const { unwrap } = useLocale();
  const id = Maps.use((state) => state.id);
  const disturbed = Maps.use((state) => state.disturbed);
  const revealed = Maps.use((state) => state.revealed);
  const isFullScreen = useFullScreen();
  const name = unwrap(mapDefinitions.maps[id].name!);

  return (
    <Flex
      overflow="hidden"
      justify="center"
      style={{
        backgroundColor: "black",
      }}
      position="relative"
    >
      <Box
        style={{
          zIndex: isFullScreen ? 2 : undefined,
          transitionDuration: "1s",
          background: "black",
        }}
        height={
          isFullScreen
            ? "100vh"
            : disturbed
              ? "calc(100svh - 8rem)"
              : {
                  initial: "28rem",
                  md: "calc(100svh - 14rem)",
                }
        }
        maxWidth={isFullScreen ? undefined : "120rem"}
        flexGrow="1"
        width={isFullScreen ? "100vw" : undefined}
        position={isFullScreen ? "fixed" : "relative"}
        top={isFullScreen ? "0" : undefined}
        left={isFullScreen ? "0" : undefined}
      >
        <Box position="absolute" width="100%" height="100%" top="0" left="0">
          {!skeleton && <MapSandbox />}
        </Box>

        {!revealed && (
          <MapSandboxLoader
            position="absolute"
            top="0"
            left="0"
            progressOffset={`min(6vh, ${37.5 / name.length}vw) + 1.5rem`}
            style={{ pointerEvents: "none" }}
          />
        )}

        <Title />

        <Options skeleton={skeleton} />

        <ControlTips />
      </Box>
    </Flex>
  );
}
