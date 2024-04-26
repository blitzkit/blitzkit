import { clamp } from 'lodash';
import CommandWrapper from '../components/CommandWrapper';
import TitleBar from '../components/TitleBar';
import { iconPng } from '../core/blitzkit/iconPng';
import { RenderConfiguration } from '../core/blitzkit/renderConfiguration';
import { tankDefinitions } from '../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../core/blitzkit/tankIcon';
import { tankAverages } from '../core/blitzstars/tankAverages';
import buttonLink from '../core/discord/buttonLink';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import calculateWN8 from '../core/statistics/calculateWN8';
import { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';

type WotInspectorReplaySubmission =
  | { status: 'error'; data: unknown; error: { message: string } }
  | {
      status: 'ok';
      data: {
        download_url: string;
        view_url: string;
        summary: {
          battle_start_time: string;
          map_name: string;
          battle_start_timestamp: number;
          battle_duration: number;
          title: string;
          arena_unique_id: string;
          allies: number[];
          enemies: number[];
          protagonist: number;
          player_name: string;
          vehicle: string;
          exp_base: number;
          exp_total: number;
          credits_base: number;
          credits_total: number;
          room_type: number;
          battle_type: number;
          mastery_badge: number;
          battle_result: number;
          vehicle_tier: number;
          vehicle_type: number;
          protagonist_team: number;
          winner_team: number;
          details: {
            achievements: unknown[];
            base_capture_points: number;
            base_defend_points: number;
            chassis_id: unknown | null;
            clan_tag: string;
            clanid: number;
            credits: number;
            damage_assisted: number;
            damage_assisted_track: number;
            damage_blocked: unknown | null;
            damage_made: number;
            damage_received: number;
            dbid: number;
            death_reason: number;
            distance_travelled: number;
            enemies_damaged: number;
            enemies_destroyed: number;
            enemies_spotted: number;
            entity_id: number;
            exp: number;
            exp_for_assist: number;
            exp_for_damage: number;
            exp_team_bonus: number;
            gun_id: unknown | null;
            hero_bonus_credits: number;
            hero_bonus_exp: number;
            hitpoints_left: number;
            hits_bounced: number;
            hits_pen: number;
            hits_received: number;
            hits_splash: number;
            killed_by: number;
            name: string;
            shots_hit: number;
            shots_made: number;
            shots_pen: number;
            shots_splash: number;
            squad_index: number;
            team: number;
            time_alive: number;
            turret_id: unknown | null;
            vehicle_descr: number;
            wp_points_earned: number;
            wp_points_stolen: number;
          };
        };
      };
      error: {};
    };

interface WotInspectorReplay {
  id: string;
  map_id: number;
  battle_duration: number;
  title: null;
  player_name: string;
  protagonist: number;
  vehicle_descr: number;
  mastery_badge: number;
  exp_base: number;
  enemies_spotted: number;
  enemies_destroyed: number;
  damage_assisted: number;
  damage_made: number;
  details_url: string;
  download_url: string;
  game_version: WotInspectorReplayGameVersion;
  arena_unique_id: string;
  download_count: number;
  data_version: number;
  private: boolean;
  private_clan: boolean;
  battle_start_time: Date;
  upload_time: Date;
  allies: number[];
  enemies: number[];
  protagonist_clan: number;
  protagonist_team: number;
  battle_result: number;
  credits_base: number;
  tags: number[];
  battle_type: number;
  room_type: number;
  last_accessed_time: Date;
  winner_team: number;
  finish_reason: number;
  players_data: WotInspectorReplayPlayerData[];
  exp_total: number;
  credits_total: number;
  repair_cost: number;
  exp_free: number;
  exp_free_base: number;
  exp_penalty: number;
  credits_penalty: number;
  credits_contribution_in: number;
  credits_contribution_out: number;
  camouflage_id: number;
}

export interface WotInspectorReplayGameVersion {
  name: string;
  package: string;
}

export interface WotInspectorReplayPlayerData {
  team: number;
  name: string;
  entity_id: number;
  dbid: number;
  clanid: number | null;
  clan_tag: null | string;
  hitpoints_left: number;
  credits: number;
  exp: number;
  shots_made: number;
  shots_hit: number;
  shots_splash: number;
  shots_pen: number;
  damage_made: number;
  damage_received: number;
  damage_assisted: number;
  damage_assisted_track: number;
  hits_received: number;
  hits_bounced: number;
  hits_splash: number;
  hits_pen: number;
  enemies_spotted: number;
  enemies_damaged: number;
  enemies_destroyed: number;
  time_alive: number;
  distance_travelled: number;
  killed_by: number;
  base_capture_points: number;
  base_defend_points: number;
  exp_for_damage: number;
  exp_for_assist: number;
  exp_team_bonus: number;
  wp_points_earned: number;
  wp_points_stolen: number;
  hero_bonus_credits: number;
  hero_bonus_exp: number;
  death_reason: number;
  achievements: any[];
  vehicle_descr: number;
  turret_id: number;
  gun_id: number;
  chassis_id: number;
  squad_index: number;
  damage_blocked: number;
}

function stat(value: string | number, flex = 2) {
  return (
    <div
      style={{
        flex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 16 }}>{value}</span>
    </div>
  );
}

async function playerListing(
  player: WotInspectorReplayPlayerData,
  protagonistTeam: boolean,
  winningTeam: number,
  recordingPlayer = false,
) {
  const awaitedTankAverages = await tankAverages;
  const awaitedTankDefinitions = await tankDefinitions;
  const tank = awaitedTankDefinitions[player.vehicle_descr];
  const blockAccent = recordingPlayer ? '_amber' : '';
  const healthAccent = protagonistTeam
    ? recordingPlayer
      ? '_amber'
      : '_green'
    : '_red';

  // our turret ids are always off by 1 or 2 lol so imma just grab the closest
  // TODO: 💀
  const turret = tank.turrets.sort(
    (a, b) =>
      Math.abs(a.id - player.turret_id) - Math.abs(b.id - player.turret_id),
  )[0];
  const totalHealth = turret.health + tank.health;
  const healthLeft = clamp(player.hitpoints_left / totalHealth, 0, 1);
  const tankAveragesEntry = awaitedTankAverages[player.vehicle_descr];
  const wn8 =
    tankAveragesEntry === undefined
      ? -1
      : calculateWN8(tankAveragesEntry.all, {
          battles: 1,
          damage_dealt: player.damage_made,
          dropped_capture_points: player.base_defend_points,
          frags: player.enemies_destroyed,
          spotted: player.enemies_spotted,
          wins: winningTeam === player.team ? 1 : 0,
        });

  return (
    <div
      key={player.entity_id}
      style={{
        backgroundColor: theme.colors[`appBackground2${blockAccent}`],
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            flex: 1,
            overflow: 'hidden',
            alignItems: 'center',
          }}
        >
          <img
            src={await iconPng(tankIcon(tank.id))}
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              // align
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: theme.colors[`textLowContrast${blockAccent}`],
                  fontSize: 12,
                }}
              >
                {TIER_ROMAN_NUMERALS[tank.tier]}
              </span>
              <span
                style={{
                  color: theme.colors[`textHighContrast${blockAccent}`],
                  fontSize: 16,
                }}
              >
                {tank.name}
              </span>
            </div>

            <span
              style={{
                fontSize: 16,
                color: theme.colors[`textLowContrast${blockAccent}`],
                whiteSpace: 'nowrap',
              }}
            >
              {player.name}
              {player.clan_tag ? ` [${player.clan_tag}]` : ''}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
          }}
        >
          {stat(player.damage_made.toLocaleString())}
          {stat(wn8 === -1 ? '--' : Math.round(wn8).toLocaleString())}
          {stat(player.exp.toLocaleString())}
          {stat(player.enemies_destroyed, 1)}
        </div>
      </div>

      <div
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors[`componentInteractive${healthAccent}`],
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${healthLeft * 100}%`,
            height: '100%',
            borderRadius: 2,
            backgroundColor: theme.colors[`solidBackground${healthAccent}`],
          }}
        />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ flex: 1 }} />

      <div
        style={{
          display: 'flex',
          flex: 1,
        }}
      >
        <div
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: theme.colors.textLowContrast,
            }}
          >
            Damage
          </span>
        </div>
        <div
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: theme.colors.textLowContrast,
            }}
          >
            WN8
          </span>
        </div>
        <div
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: theme.colors.textLowContrast,
            }}
          >
            XP
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: theme.colors.textLowContrast,
            }}
          >
            Kills
          </span>
        </div>
      </div>
    </div>
  );
}

export const replayCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    inProduction: true,
    inPublic: true,
    command: createLocalizedCommand('replay').addAttachmentOption((option) =>
      option.setName('file').setDescription('Replay file').setRequired(true),
    ),

    async handler(interaction) {
      const file = interaction.options.getAttachment('file')!;
      // const file = {
      //   url: 'https://cdn.discordapp.com/ephemeral-attachments/1232434891652861972/1232781496016834581/20240328_1530__TresAbhi_M60_1157057448155406708.wotbreplay?ex=662ab4bc&is=6629633c&hm=c784cd10e80232350ddaf291fa987b879c4d0a8083b78298c9eee4fa0d507f6c&',
      // };
      const submissionData = (await fetch(
        `https://wotinspector.com/api/replay/upload/?url=${encodeURIComponent(
          file.url,
        )}`,
      ).then((response) => response.json())) as WotInspectorReplaySubmission;

      if (submissionData.status === 'error') {
        return `# Uh oh! WoT Inspector didn't like that.\n\nThere was an error processing your replay. Get help on [the official Discord server](https://discord.gg/nDt7AjGJQH).`;
      }

      const replayId = submissionData.data.download_url.split('/').at(-1)!;
      const replayData = (await fetch(
        `https://api.wotinspector.com/v2/blitz/replays/${replayId}/`,
      ).then((response) => response.json())) as WotInspectorReplay;
      const protagonistTeamId = replayData.players_data.find(
        (player) => player.dbid === replayData.protagonist,
      )!.team;
      const antagonistTeamId = 3 - protagonistTeamId;
      const players = replayData.players_data.sort(
        (a, b) => b.damage_made - a.damage_made,
      );

      return [
        new RenderConfiguration({ width: 960 }),
        <CommandWrapper>
          <TitleBar
            title={replayData.player_name}
            description={`uwu <3 xoxo hugs and kicks`}
          />

          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <Header />

              {await Promise.all(
                players
                  .filter((player) => player.team === protagonistTeamId)
                  .map((player) =>
                    playerListing(
                      player,
                      true,
                      replayData.winner_team,
                      player.dbid === replayData.protagonist,
                    ),
                  ),
              )}
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <Header />

              {await Promise.all(
                players
                  .filter((player) => player.team === antagonistTeamId)
                  .map((player) =>
                    playerListing(player, false, replayData.winner_team),
                  ),
              )}
            </div>
          </div>
        </CommandWrapper>,
        buttonLink(submissionData.data.view_url, 'WoT Inspector'),
        buttonLink(submissionData.data.download_url, 'Download'),
      ];
    },
  });
});
