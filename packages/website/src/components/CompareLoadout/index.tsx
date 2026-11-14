import { alias } from "@blitzkit/core";
import { CheckIcon, ComponentPlaceholderIcon } from "@radix-ui/react-icons";
import { chunk } from "lodash-es";
import { api } from "../../api/dynamic";
import { equipmentColumns } from "../../config/equipment";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { CompareEphemeral } from "../../stores/compareEphemeral";
import { resolveTankModules } from "../../tankopedia/resolveTankModules";
import { selectModule } from "../../tankopedia/selectModule";
import { Button, type ButtonProps } from "../Button";
import { IconButton } from "../IconButton";
import { LoadoutConsumables } from "../LoadoutConsumables";
import { LoadoutEquipment } from "../LoadoutEquipment";
import { LoadoutModules } from "../LoadoutModules";
import { LoadoutProvisions } from "../LoadoutProvisions";
import { Popover } from "../Popover";
import styles from "./index.module.css";

const equipment = await api.equipment();
const consumables = await api.consumables();
const provisions = await api.provisions();

interface CompareLoadoutProps {
  index: number;
}

export function CompareLoadout({ index }: CompareLoadoutProps) {
  return (
    <div className={styles.loadout}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <ModulesSummary />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content>
            <Modules index={index} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <div className={styles.triggers}>
        <Popover.Root>
          <Popover.Trigger asChild>
            <ItemsSummary index={index} kind="provisions" />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content>
              <Provisions index={index} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <EquipmentSummary index={index} />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content>
              <Equipment index={index} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger asChild>
            <ItemsSummary index={index} kind="consumables" />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content>
              <Consumables index={index} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <Camouflage index={index} />
    </div>
  );
}

interface SectionProps {
  index: number;
}

function useMember(index: number) {
  const state = CompareEphemeral.use((state) => state.members[index].state);

  return { state, ...resolveTankModules(state) };
}

function Camouflage({ index }: SectionProps) {
  const strings = useStrings();
  const { tank, state } = useMember(index);

  if (tank.fixed_camouflage) return null;

  return (
    <IconButton
      color={state.camouflage ? undefined : "gray"}
      variant={state.camouflage ? "solid" : "outline"}
      aria-pressed={state.camouflage}
      onClick={() => {
        CompareEphemeral.mutate((draft) => {
          draft.members[index].state.camouflage = !state.camouflage;
          draft.sorting.by = null;
        });
      }}
    >
      <img
        alt={strings.tanks.loadout.camouflage}
        src={alias("api", "/icons/camo.webp")}
      />
    </IconButton>
  );
}

type SummaryProps = Omit<ButtonProps, "children">;

function ModulesSummary(props: SummaryProps) {
  const strings = useStrings();

  return (
    <IconButton variant="ghost" size="major" {...props}>
      <div className={styles["modules-summary"]}>
        {(["turret", "gun", "engine", "chassis"] as const).map((module) => (
          <img
            key={module}
            alt={strings.tanks.loadout.module_types[module]}
            className={styles["summary-module"]}
            src={alias("api", `/icons/modules/${module}.webp`)}
          />
        ))}
      </div>
    </IconButton>
  );
}

interface ItemsSummaryProps extends SummaryProps, SectionProps {
  kind: "provisions" | "consumables";
}

function ItemsSummary({ index, kind, ...props }: ItemsSummaryProps) {
  const unwrap = useUnwrapper();
  const { state } = useMember(index);
  const selected = state[kind];

  return (
    <IconButton variant="ghost" {...props}>
      <div className={styles["items-summary"]}>
        {selected.map((id) => (
          <img
            key={id}
            alt={unwrap(
              kind === "provisions"
                ? provisions.provisions[id].name
                : consumables.consumables[id].name,
            )}
            className={styles["summary-item"]}
            src={alias("api", `/icons/${kind}/${id}.webp`)}
          />
        ))}

        {selected.length === 0 && <ComponentPlaceholderIcon />}
      </div>
    </IconButton>
  );
}

interface EquipmentSummaryProps extends SummaryProps, SectionProps {}

function EquipmentSummary({ index, ...props }: EquipmentSummaryProps) {
  const { tank, state } = useMember(index);
  const preset = equipment.presets[tank.equipment_preset];

  return (
    <IconButton variant="ghost" size="major" {...props}>
      <div className={styles["equipment-summary"]}>
        {chunk(preset.slots, equipmentColumns).map((slots, rowIndex) => (
          <div key={rowIndex} className={styles["summary-row"]}>
            {slots.map((slot, columnIndex) => {
              const slotIndex = rowIndex * equipmentColumns + columnIndex;

              return (
                <div key={columnIndex} className={styles["summary-slot"]}>
                  {slot.options.map((_, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={styles.bar}
                      data-active={state.equipment[slotIndex] === optionIndex}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </IconButton>
  );
}

function Modules({ index }: SectionProps) {
  const { tank, state } = useMember(index);

  function setAll(position: "first" | "last") {
    CompareEphemeral.mutate((draft) => {
      const member = draft.members[index];
      const pick = <Item,>(list: Item[]) =>
        position === "first" ? list[0] : list.at(-1)!;
      const nextTurret = pick(tank.turrets);
      const nextGun = pick(nextTurret.guns);

      member.state.turret = nextTurret.id;
      member.state.gun = nextGun.id;
      member.state.shell = nextGun.shells[0].id;
      member.state.engine = pick(tank.engines).id;
      member.state.track = pick(tank.tracks).id;
      draft.sorting.by = null;
    });
  }

  return (
    <LoadoutModules
      tank={tank}
      selected={state}
      onSelect={(unlock) => {
        CompareEphemeral.mutate((draft) => {
          selectModule(draft.members[index].state, tank, unlock);
          draft.sorting.by = null;
        });
      }}
      onStock={() => setAll("first")}
      onMaximize={() => setAll("last")}
    />
  );
}

function Equipment({ index }: SectionProps) {
  const strings = useStrings();
  const { tank, state } = useMember(index);

  return (
    <LoadoutEquipment
      tank={tank}
      selected={state.equipment}
      onToggle={(slotIndex, optionIndex) => {
        CompareEphemeral.mutate((draft) => {
          const current = draft.members[index].state.equipment;

          if (current[slotIndex] === optionIndex) delete current[slotIndex];
          else current[slotIndex] = optionIndex;

          draft.sorting.by = null;
        });
      }}
      onClear={() => {
        CompareEphemeral.mutate((draft) => {
          draft.members[index].state.equipment = {};
          draft.sorting.by = null;
        });
      }}
      actions={
        <Button
          color="gray"
          variant="ghost"
          size="minor"
          onClick={() => {
            CompareEphemeral.mutate((draft) => {
              for (const member of draft.members) {
                member.state.equipment = {
                  ...draft.members[index].state.equipment,
                };
              }
              draft.sorting.by = null;
            });
          }}
        >
          <CheckIcon />
          {strings.compare.apply_to_all}
        </Button>
      }
    />
  );
}

function Provisions({ index }: SectionProps) {
  const { tank, gun, state } = useMember(index);

  return (
    <LoadoutProvisions
      implicitWidth
      tank={tank}
      gun={gun}
      selected={state.provisions}
      onToggle={(id) => {
        CompareEphemeral.mutate((draft) => {
          const list = draft.members[index].state.provisions;
          const position = list.indexOf(id);

          if (position === -1) {
            if (list.length >= tank.max_provisions) return;

            list.push(id);
          } else {
            list.splice(position, 1);
          }

          draft.sorting.by = null;
        });
      }}
      onClear={() => {
        CompareEphemeral.mutate((draft) => {
          draft.members[index].state.provisions = [];
          draft.sorting.by = null;
        });
      }}
    />
  );
}

function Consumables({ index }: SectionProps) {
  const { tank, gun, state } = useMember(index);

  return (
    <LoadoutConsumables
      tank={tank}
      gun={gun}
      selected={state.consumables}
      onToggle={(id) => {
        CompareEphemeral.mutate((draft) => {
          const list = draft.members[index].state.consumables;
          const position = list.indexOf(id);

          if (position === -1) {
            if (list.length >= tank.max_consumables) return;

            list.push(id);
          } else {
            list.splice(position, 1);
          }

          draft.sorting.by = null;
        });
      }}
      onClear={() => {
        CompareEphemeral.mutate((draft) => {
          draft.members[index].state.consumables = [];
          draft.sorting.by = null;
        });
      }}
    />
  );
}
