import { youtubers } from '@blitzkit/core';
import { CaretRightIcon } from '@radix-ui/react-icons';
import { Box, Flex, Link, Skeleton, Text } from '@radix-ui/themes';
import { awaitableReviews } from '../../../../core/awaitables/reviews';
import { Var } from '../../../../core/radix/var';
import { Duel } from '../../../../stores/duel';
import type { MaybeSkeletonComponentProps } from '../../../../types/maybeSkeletonComponentProps';
import { VerifiedIcon } from '../../../VerifiedIcon';

const reviews = await awaitableReviews;

export function YouTube({ skeleton }: MaybeSkeletonComponentProps) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const videos = reviews.reviews[tank.id]?.videos;

  if (!videos) return null;

  return (
    <>
      <Flex direction="column" gap="4" position="relative">
        <Text size="4" weight="medium">
          <Flex width="100%" justify="start" align="center" gap="2">
            <img
              style={{
                width: '1.5em',
                height: '1.5em',
                objectFit: 'contain',
              }}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/330px-YouTube_full-color_icon_%282017%29.svg.png"
            />
            YouTube
          </Flex>
        </Text>

        <Flex direction="column" gap="3">
          {videos.map((video) => {
            const image = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            const youtuber = youtubers.find(
              (youtuber) => youtuber.id === video.author,
            );

            if (!youtuber) return null;

            return (
              <Link
                color="gray"
                highContrast
                underline="hover"
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
              >
                <Flex
                  width="fit-content"
                  direction="column"
                  style={{
                    borderRadius: 'var(--radius-3)',
                    overflow: 'hidden',
                    background: skeleton
                      ? Var('color-panel-solid')
                      : `url(${image})`,
                    backgroundPosition: '0 18px',
                    backgroundSize: 'cover',
                  }}
                >
                  <Box
                    style={{
                      background: skeleton ? 'transparent' : `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: 128,
                      aspectRatio: '16 / 9',
                    }}
                  />
                  <Flex
                    p="2"
                    width="100%"
                    justify="center"
                    style={{
                      backdropFilter: 'blur(4rem)',
                      WebkitBackdropFilter: 'blur(4rem)',
                    }}
                    align="center"
                    gap="1"
                  >
                    <Text>
                      {!skeleton && youtuber.name}
                      {skeleton && <Skeleton height="1em" width="7rem" />}
                    </Text>
                    {!skeleton && <VerifiedIcon width="1em" height="1em" />}
                  </Flex>
                </Flex>
              </Link>
            );
          })}
        </Flex>

        <Box
          position="absolute"
          bottom="0"
          width="100%"
          height="100%"
          left="0"
          style={{
            background: `linear-gradient(${Var('gray-a1')}, ${Var('gray-1')})`,
          }}
        />
      </Flex>

      <Link underline="always" target="_blank">
        <Flex width="100%" justify="center" align="center" gap="1">
          Read the full guide
          <CaretRightIcon width="1em" height="1em" />
        </Flex>
      </Link>
    </>
  );
}
