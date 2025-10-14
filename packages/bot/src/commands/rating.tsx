import {
  deltaBkrlBlitzStats,
  emblemURL,
  getAccountInfo,
  getArchivedRatingLeaderboard,
  getClanAccountInfo,
  getLeagueFromScore,
  getRatingInfo,
  getRatingNeighbors,
  imgur,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { SlashCommandSubcommandBuilder } from "discord.js";
import markdownEscape from "markdown-escape";
import { Glow } from "../components/AllStatsOverview/components/HeroStat/components/Glow";
import { CommandWrapper } from "../components/CommandWrapper";
import { DeltaCaret } from "../components/DeltaCaret";
import { TitleBar } from "../components/TitleBar";
import { normalizeLeagueIcon } from "../core/blitz/normalizeLeagueIcon";
import { iconPng } from "../core/blitzkit/iconPng";
import { addUsernameChoices } from "../core/discord/addUsernameChoices";
import { createLocalizedCommand } from "../core/discord/createLocalizedCommand";
import { resolvePlayerFromCommand } from "../core/discord/resolvePlayerFromCommand";
import { translator } from "../core/localization/translator";
import type { CommandRegistry } from "../events/interactionCreate";
import { theme } from "../stitches.config";

const LEAGUE_ACCENT = [
  "_purple",
  "_sand",
  "_amber",
  "_mauve",
  "_brown",
] as const;

export const ratingCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand("rating", [
      {
        subcommand: "today",
        modify(option: SlashCommandSubcommandBuilder) {
          option.addStringOption(addUsernameChoices);
        },
      },
      {
        subcommand: "season",
        modify(option: SlashCommandSubcommandBuilder) {
          option.addStringOption(addUsernameChoices);
        },
      },
    ]),

    async handler(interaction) {
      const subcommand = interaction.options.getSubcommand(true) as
        | "season"
        | "today";
      const { strings } = translator(interaction.locale);
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const clan = (await getClanAccountInfo(region, id, ["clan"]))?.clan;
      const clanImage = clan ? emblemURL(clan.emblem_set_id) : undefined;

      const ratingInfo = await getRatingInfo(region);

      if (ratingInfo.detail) {
        throw new Error(`Rating info not available for ${region}`);
      }

      const leaderboard = await getArchivedRatingLeaderboard(
        region,
        ratingInfo.current_season - (subcommand === "today" ? 0 : 1)
      );

      if (leaderboard.version!.$case === "v1") {
        throw new Error(
          "Encountered bkrl minimal format in latest season. Wait till next cron?"
        );
      }

      const accountInfo = await getAccountInfo(region, id, [
        "statistics.rating",
      ]);
      const statsIndex = leaderboard.version!.value.entries.findIndex(
        (entry) => entry.id === id
      );
      const statsA = leaderboard
        ? leaderboard.version!.value.entries[statsIndex!]
        : null;
      const positionA = leaderboard ? statsIndex! + 1 : undefined;
      const statsB1 = accountInfo.statistics.rating!;
      const statsB2Array = (await getRatingNeighbors(region, id, 0)).neighbors;

      if (statsB2Array === undefined) {
        return literals(strings.bot.commands.rating.errors.no_participation, {
          name: markdownEscape(accountInfo.nickname),
        });
      }

      const [statsB2] = statsB2Array;
      const league = getLeagueFromScore(statsB2.score);

      if (!statsA) {
        return strings.bot.commands.rating.errors.unrecorded_stats;
      }
      if (!statsB1) {
        return literals(strings.bot.commands.rating.errors.no_participation, {
          name: markdownEscape(accountInfo.nickname),
        });
      }

      const reward = ratingInfo.rewards.find(
        (reward) =>
          statsB2.number >= reward.from_position &&
          statsB2.number <= reward.to_position
      );
      const positionDelta = leaderboard
        ? statsB2.number - positionA!
        : undefined;
      const delta = deltaBkrlBlitzStats(
        statsA,
        accountInfo.statistics.rating!,
        statsB2
      );
      const leagueTheme = LEAGUE_ACCENT[league.index];
      let rewardImage = reward
        ? reward.type === "vehicle"
          ? reward.vehicle.preview_image_url
          : reward.stuff.image_url
        : undefined;

      if (rewardImage) {
        const { ok } = await fetch(rewardImage);

        if (!ok) {
          rewardImage = imgur("kP88vqr");
        }
      }

      return (
        <CommandWrapper>
          <TitleBar
            title={accountInfo.nickname}
            image={clanImage}
            description={`${
              strings.bot.commands.rating.body.subtitle[subcommand]
            } • ${new Date().toLocaleDateString(interaction.locale)}`}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                padding: 16,
                backgroundColor: theme.colors[`appBackground2${leagueTheme}`],
                borderRadius: 4,
                border: `1px solid ${
                  theme.colors[`componentInteractive${leagueTheme}`]
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {reward === undefined && (
                <Glow
                  endOpacity={3 / 4}
                  color={theme.colors[`solidBackground${leagueTheme}`]}
                  style={{
                    transform: "translateX(-16px) rotate(90deg)",
                  }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  alt={`League ${league.name}`}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "contain",
                  }}
                  src={normalizeLeagueIcon(
                    ratingInfo.leagues[league.index].big_icon
                  )}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        color: theme.colors[`textHighContrast${leagueTheme}`],
                        fontSize: 24,
                        fontWeight: 900,
                      }}
                    >
                      {statsB2.score.toLocaleString(interaction.locale)}
                    </span>
                    {delta.score !== 0 && (
                      <>
                        <DeltaCaret delta={delta.score} />
                        <span
                          style={{
                            color:
                              delta.score > 0
                                ? theme.colors.textLowContrast_green
                                : theme.colors.textLowContrast_red,
                            fontSize: 16,
                          }}
                        >
                          {Math.abs(delta.score).toLocaleString(
                            interaction.locale
                          )}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        color: theme.colors[`textLowContrast${leagueTheme}`],
                        fontSize: 16,
                      }}
                    >
                      #{statsB2.number.toLocaleString(interaction.locale)}
                    </span>
                    {positionDelta !== undefined && positionDelta !== 0 && (
                      <>
                        <DeltaCaret delta={-positionDelta} />
                        <span
                          style={{
                            color:
                              positionDelta > 0
                                ? theme.colors.textLowContrast_red
                                : theme.colors.textLowContrast_green,
                            fontSize: 16,
                          }}
                        >
                          {Math.abs(positionDelta).toLocaleString(
                            interaction.locale
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {reward && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          color: theme.colors[`textHighContrast${leagueTheme}`],
                          fontSize: 16,
                          maxWidth: 136,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {reward.type === "vehicle"
                          ? reward.vehicle.user_string
                          : reward.stuff.title}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          color: theme.colors[`textLowContrast${leagueTheme}`],
                          fontSize: 16,
                        }}
                      >
                        Reward
                        {reward.type === "stuff" ? ` x${reward.count}` : ""}
                      </span>
                    </div>
                  </div>

                  <img
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                    }}
                    src={await iconPng(rewardImage!)}
                  />
                </div>
              )}

              {reward === undefined && (
                <Glow
                  endOpacity={3 / 4}
                  color={theme.colors[`solidBackground${leagueTheme}`]}
                  style={{
                    transform: "translateX(16px) rotate(-90deg)",
                  }}
                />
              )}
            </div>

            {/* separated because fragment middle man invalidates relative parent: https://github.com/vercel/satori/issues/605 */}
            {reward && (
              <Glow
                direction="reverse"
                color={theme.colors[`solidBackground${leagueTheme}`]}
                style={{
                  position: "absolute",
                  top: -40,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
            {reward && (
              <Glow
                color={theme.colors[`solidBackground${leagueTheme}`]}
                style={{
                  position: "absolute",
                  bottom: -40,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </div>

          {delta.battles > 0 && (
            <div style={{ padding: "8px 0", display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: theme.colors.textHighContrast,
                    fontWeight: "bold",
                  }}
                >
                  {delta.battles.toLocaleString(interaction.locale)}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: theme.colors.textLowContrast,
                  }}
                >
                  Battles
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: theme.colors.textHighContrast,
                    fontWeight: "bold",
                  }}
                >
                  {(100 * (delta.wins / delta.battles)).toFixed(0)}%
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: theme.colors.textLowContrast,
                  }}
                >
                  Winrate
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: theme.colors.textHighContrast,
                    fontWeight: "bold",
                  }}
                >
                  {Math.round(delta.damage / delta.battles).toLocaleString(
                    interaction.locale
                  )}
                </span>
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: theme.colors.textHighContrast,
                    fontWeight: "bold",
                  }}
                >
                  {(100 * (delta.survived / delta.battles)).toFixed(0)}%
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: theme.colors.textLowContrast,
                  }}
                >
                  Survival
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: theme.colors.textHighContrast,
                    fontWeight: "bold",
                  }}
                >
                  {(delta.kills / delta.battles).toFixed(2)}
                </span>
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
          )}
        </CommandWrapper>
      );
    },
  });
});
