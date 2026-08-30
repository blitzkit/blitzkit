import { alias, Avatar } from "@blitzkit/core";
import { Cross1Icon, DownloadIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { useIntersection } from "../hooks/useIntersection";
import { useLocale } from "../hooks/useLocale";
import type { MaybeSkeletonComponentProps } from "../types/maybeSkeletonComponentProps";
import { Flex } from "./Flex";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

type GalleryCardProps = MaybeSkeletonComponentProps<{
  avatar: Avatar;
}>;

export function AvatarCard(props: GalleryCardProps) {
  const src = alias(
    "api",
    `/gallery/avatars/${!props.skeleton && `${props.avatar.id}${props.avatar.extension}`}`,
  );
  const card = useRef<HTMLDivElement>(null!);
  const { unwrap } = useLocale();

  useIntersection(() => props.skeleton && props.onIntersection?.(), card, {
    disabled: !props.skeleton || props.onIntersection === undefined,
  });

  const content = (
    <Flex
      column
      align="center"
      gap="1"
      ref={card}
      style={{ cursor: "pointer" }}
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
    </Flex>
  );

  if (props.skeleton) return content;

  return (
    <Dialog.Root>
      <Dialog.Trigger>{content}</Dialog.Trigger>

      <Dialog.Content
        onOpenAutoFocus={(event) => event.preventDefault()}
        width="fit-content"
      >
        <Flex position="absolute" top="3" right="3" gap="3">
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
        </Flex>

        <Flex px="4" justify="center" mt="3">
          <img src={src} alt={unwrap(props.avatar.name!)} />
        </Flex>

        <Flex justify="center" mt="4">
          <Dialog.Title align="center" style={{ maxWidth: "10rem" }}>
            {unwrap(props.avatar.name!)}
          </Dialog.Title>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
