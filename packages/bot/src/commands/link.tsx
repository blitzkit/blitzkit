import { getAccountInfo, getClanAccountInfo } from '@blitzkit/core';
import { teal } from '@radix-ui/colors';
import { Glow } from '../components/AllStatsOverview/components/HeroStat/components/Glow';
import { CommandWrapper } from '../components/CommandWrapper';
import { linkBlitzAndDiscord } from '../core/db/linkBlitzAndDiscord';
import { addUsernameChoices } from '../core/discord/addUsernameChoices';
import { autocompleteUsername } from '../core/discord/autocompleteUsername';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { embedInfo } from '../core/discord/embedInfo';
import { resolvePlayerFromCommand } from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import type { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';

export const verifyCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand('link').addStringOption((option) =>
      addUsernameChoices(option).setRequired(true),
    ),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const discordId = BigInt(interaction.user.id);
      const accountInfo = await getAccountInfo(region, id);
      const clanAccountInfo = await getClanAccountInfo(region, id, ['clan']);

      await linkBlitzAndDiscord(discordId, id);

      return [
        <CommandWrapper fat>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Glow color={teal.teal9} rotation={90} />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  alt="avatar"
                  src={
                    interaction.user.avatarURL({ extension: 'png' }) ??
                    'https://i.stack.imgur.com/l60Hf.png'
                  }
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    objectFit: 'cover',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      color: theme.colors.textHighContrast,
                      fontWeight: 900,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {interaction.user.displayName}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.textLowContrast,
                    }}
                  >
                    @{interaction.user.username}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  color: theme.colors.textLowContrast_teal,
                }}
              >
                <img
                  alt="accounts linked"
                  src="https://i.imgur.com/jIcRgog.png"
                  style={{
                    width: 16,
                    height: 16,
                  }}
                />
                <span style={{ fontSize: 16 }}>
                  {strings.bot.commands.link.body.accounts_linked}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {clanAccountInfo?.clan ? (
                  <img
                    alt="clan emblem"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      objectFit: 'cover',
                    }}
                    src={`https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanAccountInfo?.clan?.emblem_set_id}.png`}
                  />
                ) : null}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      color: theme.colors.textHighContrast,
                      fontWeight: 900,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {accountInfo.nickname}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.textLowContrast,
                    }}
                  >
                    {clanAccountInfo?.clan
                      ? `[${clanAccountInfo?.clan?.tag}] • `
                      : ''}
                    {strings.common.regions.normal[region]}
                  </span>
                </div>
              </div>
            </div>

            <Glow color={teal.teal9} rotation={-90} />
          </div>
        </CommandWrapper>,

        embedInfo(
          strings.bot.commands.link.embed.title,
          strings.bot.commands.link.embed.description,
        ),
      ];
    },

    autocomplete: autocompleteUsername,
  });
});
