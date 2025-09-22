import { CameraIcon, CopyIcon, DownloadIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  IconButton,
  Popover,
  type ButtonProps,
} from "@radix-ui/themes";
import type { RefObject } from "react";
import { useLocale } from "../hooks/useLocale";
import { screenshotReadyEvent } from "./Tankopedia/HeroSection/components/TankSandbox/components/SceneProps";

interface Props extends ButtonProps {
  canvas: RefObject<HTMLCanvasElement>;
  name: string;
}

export function ScreenshotButton({ canvas, name, children, ...props }: Props) {
  const { strings } = useLocale();

  return (
    <Popover.Root>
      <Popover.Trigger>
        {children ? (
          <Button {...props}>
            <CameraIcon />
            {children}
          </Button>
        ) : (
          <IconButton {...props}>
            <CameraIcon />
          </IconButton>
        )}
      </Popover.Trigger>

      <Popover.Content>
        <Flex direction="column" gap="2">
          <Popover.Close>
            <Button
              onClick={() => {
                screenshotReadyEvent.dispatch(true);

                requestAnimationFrame(() => {
                  if (!canvas.current) return;

                  const anchor = document.createElement("a");

                  anchor.setAttribute("download", `${name}.png`);
                  anchor.setAttribute(
                    "href",
                    canvas.current.toDataURL("image/png")
                  );
                  anchor.click();

                  screenshotReadyEvent.dispatch(false);
                });
              }}
            >
              <DownloadIcon />
              {strings.website.tools.tankopedia.sandbox.screenshot.download}
            </Button>
          </Popover.Close>
          <Popover.Close>
            <Button
              variant="outline"
              onClick={() => {
                screenshotReadyEvent.dispatch(true);

                requestAnimationFrame(() => {
                  if (!canvas.current) return;

                  canvas.current.toBlob((blob) => {
                    if (!blob) return;

                    navigator.clipboard.write([
                      new ClipboardItem({ "image/png": blob }),
                    ]);
                  });

                  screenshotReadyEvent.dispatch(false);
                });
              }}
            >
              <CopyIcon />
              {strings.website.tools.tankopedia.sandbox.screenshot.copy}
            </Button>
          </Popover.Close>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
