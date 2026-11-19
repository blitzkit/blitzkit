import { assertSecret } from '@blitzkit/core';
import { CaretRightIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Link, Text } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { discordLink } from '../../config/socials';
import { getStrings } from '../../core/i18n/getStrings';
import { Var } from '../../core/radix/var';
import type { LocaleAcceptorProps } from '../../hooks/useLocale';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { InlineSkeleton } from '../InlineSkeleton';
import './index.css';

export interface DiscordWidget {
  id: string;
  name: string;
  instant_invite: string;
  channels: any[];
  members: Member[];
  presence_count: number;
}

export interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: null;
  status: Status;
  avatar_url: string;
  game?: Game;
}

export interface Game {
  name: string;
}

export enum Status {
  DND = 'dnd',
  Idle = 'idle',
  Online = 'online',
}

const COLUMN_COUNT = 3;

const discordServerId = assertSecret(import.meta.env.PUBLIC_DISCORD_SERVER_ID);
const widget = await fetch(
  `https://discord.com/api/guilds/${discordServerId}/widget.json`,
).then((response) => response.json() as Promise<DiscordWidget>);
const filteredMembers = widget.members
  .filter((member) => {
    const isPrivateUsername =
      member.username.length === 4 && member.username.endsWith('...');
    return !isPrivateUsername;
  })
  .sort(() => Math.random() - 0.5);

const columnSize = Math.floor(filteredMembers.length / COLUMN_COUNT);
const columns = times(COLUMN_COUNT, (index) => {
  const start = index * columnSize;
  const end = start + columnSize;
  return filteredMembers.slice(start, end);
});

function Member({
  id,
  avatar_url,
  username,
  status,
  skeleton,
}: Member & MaybeSkeletonComponentProps) {
  let statusColor: string;

  if (skeleton) {
    statusColor = Var('gray-9');
  } else {
    switch (status) {
      case Status.DND:
        statusColor = Var('red-9');
        break;

      case Status.Idle:
        statusColor = Var('amber-9');
        break;

      case Status.Online:
        statusColor = Var('jade-9');
        break;
    }
  }

  return (
    <Text
      style={{
        maxWidth: '8rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flexShrink: 0,
      }}
      color="gray"
    >
      <Flex key={id} align="center" gap="2" flexShrink="0" width="8rem">
        <Box width="1.5em" height="1.5em" flexShrink="0" position="relative">
          {!skeleton && (
            <img
              src={avatar_url}
              alt={`${username} profile picture`}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          )}
          {skeleton && (
            <Box
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: Var('gray-6'),
              }}
            />
          )}

          <Box
            width="0.5em"
            height="0.5em"
            position="absolute"
            bottom="0"
            right="0"
            style={{ borderRadius: '50%', backgroundColor: statusColor }}
          />
        </Box>

        {skeleton && <InlineSkeleton style={{ flex: 1 }} />}
        {!skeleton && username}
      </Flex>
    </Text>
  );
}

function Scroller({
  index,
  skeleton,
}: { index: number } & MaybeSkeletonComponentProps) {
  return (
    <Flex gap="6" className={`scroller-${index}`} pt="2">
      {columns.map((column, index) => (
        <Flex direction="column" gap="2" key={index}>
          {column.map((member) => (
            <Member skeleton={skeleton} key={member.id} {...member} />
          ))}
        </Flex>
      ))}
    </Flex>
  );
}

export function DiscordPlug({
  locale,
  skeleton,
}: LocaleAcceptorProps & MaybeSkeletonComponentProps) {
  const strings = getStrings(locale);

  return (
    <Flex justify="center" flexGrow="1" flexShrink="0">
      <Link
        style={{ display: 'contents' }}
        href={discordLink}
        target="_blank"
      >
        <Flex
          direction="column"
          maxWidth="26rem"
          overflow="hidden"
          style={{
            borderRadius: Var('radius-2'),
          }}
        >
          <Box
            height="5rem"
            style={{
              perspective: '32rem',
              background: `linear-gradient(90deg, ${Var('indigo-2')}, ${Var('blue-2')}, ${Var('purple-2')})`,
            }}
            position="relative"
            overflow="hidden"
          >
            <Flex
              top="-250%"
              position="absolute"
              direction="column"
              width="fit-content"
              height="32rem"
              flexGrow="1"
              overflow="hidden"
              style={{
                transform: 'rotateX(60deg) rotateZ(-20deg)',
              }}
            >
              <Scroller skeleton={skeleton} index={0} />
              <Scroller skeleton={skeleton} index={1} />
            </Flex>
          </Box>

          <Flex
            align="center"
            justify="between"
            p="3"
            gap="4"
            style={{
              background: `linear-gradient(90deg, ${Var('indigo-3')}, ${Var('blue-3')}, ${Var('purple-3')})`,
            }}
          >
            <Box display={{ initial: 'block', xs: 'none' }}>
              <Text color="gray" highContrast>
                {strings.website.home.discord.join_short}
              </Text>
            </Box>
            <Box display={{ initial: 'none', xs: 'block' }}>
              <Text color="gray" highContrast>
                {strings.website.home.discord.join_long}
              </Text>
            </Box>

            <Button color="iris">
              {strings.website.home.discord.action}
              <CaretRightIcon />
            </Button>
          </Flex>
        </Flex>
      </Link>
    </Flex>
  );
}
