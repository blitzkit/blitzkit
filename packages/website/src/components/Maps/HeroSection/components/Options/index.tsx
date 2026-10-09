import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import { resetViewEvent } from "../../../../../core/maps/resetView";
import { useFullScreen } from "../../../../../hooks/useFullScreen";
import { useFullscreenAvailability } from "../../../../../hooks/useFullscreenAvailability";
import { useLocale } from "../../../../../hooks/useLocale";
import { Maps } from "../../../../../stores/maps";
import type { MaybeSkeletonComponentProps } from "../../../../../types/maybeSkeletonComponentProps";

export function Options({ skeleton }: MaybeSkeletonComponentProps) {
  const { strings } = useLocale();
  const isFullScreen = useFullScreen();
  const fullScreenAvailable = useFullscreenAvailability(true);
  const revealed = Maps.use((state) => state.revealed);
  const disturbed = Maps.use((state) => state.disturbed);

  return (
    <Flex
      direction="column"
      align="center"
      position="absolute"
      bottom={revealed && !skeleton ? "4" : "-100%"}
      left="50%"
      style={{
        transform: "translateX(-50%)",
        transitionDuration: "200ms",
      }}
      gap="2"
    >
      <Flex
        gap="2"
        align="center"
        style={{ transitionDuration: "200ms" }}
        position="relative"
      >
        {disturbed && (
          <>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  size="2"
                  variant="surface"
                  highContrast
                  color="gray"
                >
                  <EyeOpenIcon />
                </IconButton>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => resetViewEvent.emit()}>
                  {strings.website.tools.maps.reset_view}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            {fullScreenAvailable && (
              <IconButton
                size="2"
                highContrast
                onClick={() => {
                  if (isFullScreen) {
                    document.exitFullscreen();
                  } else document.body.requestFullscreen();
                }}
                color={isFullScreen ? undefined : "gray"}
                variant={isFullScreen ? "solid" : "surface"}
              >
                {isFullScreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
              </IconButton>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
}
