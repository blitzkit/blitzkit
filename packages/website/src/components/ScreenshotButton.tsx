import { CameraIcon, CopyIcon, DownloadIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  IconButton,
  Popover,
  type ButtonProps,
} from "@radix-ui/themes";
import { Jimp } from "jimp";
import { useCallback, type RefObject } from "react";
import { useLocale } from "../hooks/useLocale";
import { screenshotReadyEvent } from "./Tankopedia/HeroSection/components/TankSandbox/components/SceneProps";

interface Props extends ButtonProps {
  canvas: RefObject<HTMLCanvasElement>;
  name: string;
}

export function ScreenshotButton({ canvas, name, children, ...props }: Props) {
  const { strings } = useLocale();

  const screenshot = useCallback(async () => {
    if (!canvas.current) {
      throw new Error("Canvas not found");
    }

    screenshotReadyEvent.dispatch(true);

    const blob = await new Promise<Blob>((resolve, reject) => {
      requestAnimationFrame(() => {
        canvas.current.toBlob((blob) => {
          screenshotReadyEvent.dispatch(false);

          if (!blob) {
            reject(new Error("Failed to capture screenshot"));
          } else {
            resolve(blob);
          }
        });
      });
    });

    const buffer = await blob.arrayBuffer();
    const image = await Jimp.fromBuffer(buffer);

    image.autocrop();

    return image;
  }, [canvas]);

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
              onClick={async () => {
                const image = await screenshot();
                const anchor = document.createElement("a");

                anchor.setAttribute("download", `${name}.png`);
                anchor.setAttribute("href", await image.getBase64("image/png"));
                anchor.click();
              }}
            >
              <DownloadIcon />
              {strings.website.tools.tankopedia.sandbox.screenshot.download}
            </Button>
          </Popover.Close>
          <Popover.Close>
            <Button
              variant="outline"
              onClick={async () => {
                const image = await screenshot();
                const buffer = await image.getBuffer("image/png");
                const blob = new Blob([buffer as unknown as ArrayBuffer], {
                  type: "image/png",
                });

                navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob }),
                ]);
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
