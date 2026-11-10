import { alias } from "@blitzkit/core";
import { Avatar } from "@blitzkit/protos";
import { Cross1Icon, DownloadIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { useIntersection } from "../hooks/useIntersection";
import { useLocale } from "../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../types/maybeSkeletonComponentProps";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

type GalleryCardProps = MaybeSkeletonComponentProps<{
  avatar: Avatar;
}>;

export function AvatarCard(props: GalleryCardProps) {
  const src = alias(
    "api",
    `/gallery/avatars/${
      !props.skeleton && `${props.avatar.id}${props.avatar.extension}`
    }`
  );
  const card = useRef<HTMLDivElement>(null!);
  const { unwrap } = useLocale();

  useIntersection(() => props.skeleton && props.onIntersection?.(), card, {
    disabled: !props.skeleton || props.onIntersection === undefined,
  });

  const content = (
    <div
      ref={card}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-1)",
        cursor: "pointer",
      }}
    >
      {props.skeleton && (
        <>
          <Skeleton />
          <Skeleton />
        </>
      )}

      {!props.skeleton && (
        <>
          <img
            style={{
              width: "4rem",
              height: "4.57rem",
              // aspect ratio 7 / 8
              objectFit: "cover",
            }}
            src={src}
            alt={unwrap(props.avatar.name!)}
          />

          <Text size="minor" align="center" style={{ maxWidth: "100%" }}>
            {unwrap(props.avatar.name!)}
          </Text>
        </>
      )}
    </div>
  );

  if (props.skeleton) return content;

  return (
    <Dialog.Root>
      <Dialog.Trigger>{content}</Dialog.Trigger>

      <Dialog.Content
        onOpenAutoFocus={(event) => event.preventDefault()}
        width="fit-content"
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "var(--space-3)",
            right: "var(--space-3)",
            gap: "var(--space-3)",
          }}
        >
          <Link download href={src}>
            <IconButton variant="ghost">
              <DownloadIcon />
            </IconButton>
          </Link>

          <Dialog.Close>
            <IconButton variant="ghost">
              <Cross1Icon />
            </IconButton>
          </Dialog.Close>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingInline: "var(--space-4)",
            marginTop: "var(--space-3)",
          }}
        >
          <img src={src} alt={unwrap(props.avatar.name!)} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-4)",
          }}
        >
          <Dialog.Title align="center" style={{ maxWidth: "10rem" }}>
            {unwrap(props.avatar.name!)}
          </Dialog.Title>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
