import { Cross1Icon, DownloadIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  Flex,
  IconButton,
  Link,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import { useRef } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';

type GalleryCardProps = MaybeSkeletonComponentProps<{
  id: string;
  name: string;
}>;

export function GalleryCard(props: GalleryCardProps) {
  const src = `/api/gallery/${!props.skeleton && props.id}.webp`;
  const card = useRef<HTMLDivElement>(null);

  useIntersection(() => props.skeleton && props.onIntersection?.(), card, {
    disabled: !props.skeleton || props.onIntersection === undefined,
  });

  const content = (
    <Flex
      direction="column"
      align="center"
      width="6rem"
      gap="1"
      ref={card}
      style={{ cursor: 'pointer' }}
    >
      {props.skeleton && (
        <>
          <Skeleton width="100%" height="4.57rem" />
          <Skeleton width="100%" height="1em" />
        </>
      )}

      {!props.skeleton && (
        <>
          <img
            style={{
              width: '4rem',
              height: '4.57rem',
              // aspect ratio 7 / 8
              objectFit: 'cover',
            }}
            src={src}
            alt={props.name}
          />

          <Text size="1" align="center" style={{ maxWidth: '100%' }}>
            {props.name}
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

        <Flex px="4">
          <img src={src} alt={props.name} />
        </Flex>

        <Flex justify="center" mt="4">
          <Dialog.Title align="center" style={{ maxWidth: '10rem' }}>
            {props.name}
          </Dialog.Title>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
