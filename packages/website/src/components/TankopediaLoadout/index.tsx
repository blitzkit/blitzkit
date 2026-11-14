import { MAX_SKILL_LEVEL } from "@blitzkit/core";
import { useDuelModules } from "../../hooks/useDuelModules";
import { Tankopedia } from "../../stores/tankopedia";
import { selectModule } from "../../tankopedia/selectModule";
import { LoadoutConsumables } from "../LoadoutConsumables";
import { LoadoutEquipment } from "../LoadoutEquipment";
import { LoadoutModules } from "../LoadoutModules";
import { LoadoutProvisions } from "../LoadoutProvisions";
import { LoadoutShells } from "../LoadoutShells";
import { LoadoutSkills } from "../LoadoutSkills";
import { LoadoutStatus } from "../LoadoutStatus";

export function TankopediaLoadout() {
  return (
    <>
      <Modules />
      <Shells />
      <Equipment />
      <Provisions />
      <Consumables />
      <CrewSkills />
      <Status />
    </>
  );
}

function Modules() {
  const protagonist = useDuelModules("protagonist");
  const selected = Tankopedia.use((state) => state.protagonist);

  function setAll(position: "first" | "last") {
    Tankopedia.mutate((draft) => {
      const pick = <Item,>(list: Item[]) =>
        position === "first" ? list[0] : list.at(-1)!;
      const turret = pick(protagonist.tank.turrets);
      const gun = pick(turret.guns);

      draft.protagonist.turret = turret.id;
      draft.protagonist.gun = gun.id;
      draft.protagonist.shell = gun.shells[0].id;
      draft.protagonist.engine = pick(protagonist.tank.engines).id;
      draft.protagonist.track = pick(protagonist.tank.tracks).id;
    });
  }

  return (
    <LoadoutModules
      tank={protagonist.tank}
      selected={selected}
      onSelect={(unlock) => {
        Tankopedia.mutate((draft) => {
          selectModule(draft.protagonist, protagonist.tank, unlock);
        });
      }}
      onStock={() => setAll("first")}
      onMaximize={() => setAll("last")}
    />
  );
}

function Shells() {
  const protagonist = useDuelModules("protagonist");

  return (
    <LoadoutShells
      gun={protagonist.gun}
      selected={protagonist.shell.id}
      onSelect={(id) => {
        Tankopedia.mutate((draft) => {
          draft.protagonist.shell = id;
        });
      }}
    />
  );
}

function Equipment() {
  const protagonist = useDuelModules("protagonist");
  const selected = Tankopedia.use((state) => state.protagonist.equipment);

  return (
    <LoadoutEquipment
      tank={protagonist.tank}
      selected={selected}
      onToggle={(slotIndex, optionIndex) => {
        Tankopedia.mutate((draft) => {
          const current = draft.protagonist.equipment;

          if (current[slotIndex] === optionIndex) delete current[slotIndex];
          else current[slotIndex] = optionIndex;
        });
      }}
      onClear={() => {
        Tankopedia.mutate((draft) => {
          draft.protagonist.equipment = {};
        });
      }}
    />
  );
}

function Provisions() {
  const protagonist = useDuelModules("protagonist");
  const selected = Tankopedia.use((state) => state.protagonist.provisions);

  return (
    <LoadoutProvisions
      tank={protagonist.tank}
      gun={protagonist.gun}
      selected={selected}
      onToggle={(id) => {
        Tankopedia.mutate((draft) => {
          const list = draft.protagonist.provisions;
          const index = list.indexOf(id);

          if (index === -1) {
            if (list.length >= protagonist.tank.max_provisions) return;

            list.push(id);
          } else {
            list.splice(index, 1);
          }
        });
      }}
      onClear={() => {
        Tankopedia.mutate((draft) => {
          draft.protagonist.provisions = [];
        });
      }}
    />
  );
}

function Consumables() {
  const protagonist = useDuelModules("protagonist");
  const selected = Tankopedia.use((state) => state.protagonist.consumables);

  return (
    <LoadoutConsumables
      tank={protagonist.tank}
      gun={protagonist.gun}
      selected={selected}
      onToggle={(id) => {
        Tankopedia.mutate((draft) => {
          const list = draft.protagonist.consumables;
          const index = list.indexOf(id);

          if (index === -1) {
            if (list.length >= protagonist.tank.max_consumables) return;

            list.push(id);
          } else {
            list.splice(index, 1);
          }
        });
      }}
      onClear={() => {
        Tankopedia.mutate((draft) => {
          draft.protagonist.consumables = [];
        });
      }}
    />
  );
}

function CrewSkills() {
  const selected = Tankopedia.use((state) => state.environment.skills);

  return (
    <LoadoutSkills
      selected={selected}
      onChange={(skill, level) => {
        Tankopedia.mutate((draft) => {
          draft.environment.skills[skill] = level;
        });
      }}
      onClear={() => {
        Tankopedia.mutate((draft) => {
          for (const skill in draft.environment.skills) {
            draft.environment.skills[skill] = 0;
          }
        });
      }}
      onMaximize={() => {
        Tankopedia.mutate((draft) => {
          for (const skill in draft.environment.skills) {
            draft.environment.skills[skill] = MAX_SKILL_LEVEL;
          }
        });
      }}
    />
  );
}

function Status() {
  const status = Tankopedia.use((state) => state.protagonist.status);

  return (
    <LoadoutStatus
      status={status}
      onToggle={(key) => {
        Tankopedia.mutate((draft) => {
          draft.protagonist.status[key] = !draft.protagonist.status[key];
        });
      }}
      onClear={() => {
        Tankopedia.mutate((draft) => {
          for (const key in draft.protagonist.status) {
            draft.protagonist.status[key as keyof typeof status] = false;
          }
        });
      }}
    />
  );
}
