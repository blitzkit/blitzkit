import { CameraIcon, CopyIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Jimp } from "jimp";
import { useCallback, type RefObject } from "react";
import { useStrings } from "../../hooks/useStrings";
import { AlertDialog } from "../AlertDialog";
import { Button, type ButtonProps } from "../Button";
import { Dialog } from "../Dialog";
import { IconButton } from "../IconButton";
import { screenshotReadyEvent } from "../SceneProps";

interface Props extends ButtonProps {
  canvas: RefObject<HTMLCanvasElement>;
  name: string;
}

// TODO: crop breaks when tank is clipping into the edge of the screen
export function ScreenshotButton({ canvas, name, children, ...props }: Props) {
  const strings = useStrings();

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
    <Dialog.Root>
      <Dialog.Trigger asChild>
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
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{strings.common.screenshot.title}</Dialog.Title>
            <Dialog.Description>
              {strings.common.screenshot.description}
            </Dialog.Description>
          </Dialog.Header>

          <AlertDialog.Actions>
            <Dialog.Close asChild>
              <Button color="red" variant="outline">
                {strings.common.screenshot.cancel}
              </Button>
            </Dialog.Close>

            <Dialog.Close asChild>
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
                {strings.common.screenshot.copy}
              </Button>
            </Dialog.Close>

            <Dialog.Close asChild>
              <Button
                onClick={async () => {
                  const image = await screenshot();
                  const anchor = document.createElement("a");

                  anchor.setAttribute("download", `${name}.png`);
                  anchor.setAttribute(
                    "href",
                    await image.getBase64("image/png"),
                  );
                  anchor.click();
                }}
              >
                <DownloadIcon />
                {strings.common.screenshot.download}
              </Button>
            </Dialog.Close>
          </AlertDialog.Actions>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
