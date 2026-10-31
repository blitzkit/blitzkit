import { alias } from "@blitzkit/core";
import { api } from "../../api/dynamic";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Heading } from "../Heading";
import { Text } from "../Text";
import styles from "./index.module.css";

const [gameDefinitions, consumableDefinitions, provisionDefinitions, tanks] =
  await Promise.all([
    api.game(),
    api.consumables(),
    api.provisions(),
    api.tanks(),
  ]);

export function TankopediaGameModeAbilities() {
  const unwrap = useUnwrapper();
  const strings = useStrings();
  const tank = useDuel("protagonist", DuelModule.Tank);
  const roles = Object.entries(tank.roles);

  if (roles.length === 0) return null;

  return (
    <section className={styles.section}>
      <Heading size="3">{strings.tanks.game_modes.title}</Heading>

      <div className={styles.cards}>
        {roles.map(([id, value]) => {
          const gameMode = gameDefinitions.gameModes[id];
          const role = gameDefinitions.roles[value];
          const banner = alias("api", `/gamemodes/${id}/banner.webp`);

          return (
            <article
              key={id}
              className={styles.card}
              style={{ backgroundImage: `url(${banner})` }}
            >
              <div
                className={styles.banner}
                style={{ backgroundImage: `url(${banner})` }}
              />

              <div className={styles.info}>
                <Text size="major" weight="bold" align="center">
                  {unwrap(gameMode.name!)}
                </Text>

                <div className={styles.abilities}>
                  {role.provisions.map((id) => {
                    const provisions = provisionDefinitions.provisions[id];

                    return (
                      <Ability
                        key={`provision-${id}`}
                        icon={alias("api", `/icons/provisions/${id}.webp`)}
                        name={unwrap(provisions.name!)}
                      />
                    );
                  })}

                  {role.consumables.map((id) => {
                    const consumable = consumableDefinitions.consumables[id];

                    return (
                      <Ability
                        key={`consumable-${id}`}
                        icon={alias("api", `/icons/consumables/${id}.webp`)}
                        name={unwrap(consumable.name!)}
                      />
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Ability({ icon, name }: { icon: string; name: string }) {
  return (
    <Text lowContrast className={styles.ability}>
      <img src={icon} alt={name} />
      {name}
    </Text>
  );
}
