import {
  availableProvisions,
  createDefaultProvisions,
  createDefaultSkills,
  fetchConsumableDefinitions,
  fetchEquipmentDefinitions,
  fetchModelDefinitions,
  fetchProvisionDefinitions,
  fetchSkillDefinitions,
  fetchTankDefinitions,
  TankDefinition,
  tankIcon,
} from "@blitzkit/core";
import { checkConsumableProvisionInclusivity } from "@blitzkit/core/src/blitzkit/checkConsumableProvisionInclusivity";
import strings from "@blitzkit/i18n/strings/en.json";
import { writeFile } from "fs/promises";
import { isEqual } from "lodash-es";
import { tankCharacteristics } from "../../website/src/core/blitzkit/tankCharacteristics";
import { genericDefaultEquipmentMatrix } from "../../website/src/stores/duel/constants";

const domain = "https://opentest.blitzkit.app";

import.meta.env.PUBLIC_ASSET_BASE = "https://blitzkit.github.io/assets";
const currentTankDefinitions = await fetchTankDefinitions();
const currentConsumableDefinitions = await fetchConsumableDefinitions();
const currentProvisionDefinitions = await fetchProvisionDefinitions();
const currentEquipmentDefinitions = await fetchEquipmentDefinitions();
const currentSkillDefinitions = await fetchSkillDefinitions();
const currentModelDefinitions = await fetchModelDefinitions();

import.meta.env.PUBLIC_ASSET_BASE = "https://blitzkit.github.io/assets-preview";
const previewTankDefinitions = await fetchTankDefinitions();
const previewConsumableDefinitions = await fetchConsumableDefinitions();
const previewProvisionDefinitions = await fetchProvisionDefinitions();
const previewEquipmentDefinitions = await fetchEquipmentDefinitions();
const previewSkillDefinitions = await fetchSkillDefinitions();
const previewModelDefinitions = await fetchModelDefinitions();

let notes = "# BlitzKit OpenTest Patch Notes\n\n";

const newTanks: TankDefinition[] = [];

for (const id in previewTankDefinitions.tanks) {
  if (!(id in currentTankDefinitions.tanks)) {
    newTanks.push(previewTankDefinitions.tanks[id]);
  }
}

newTanks.sort((a, b) => b.tier - a.tier);

import.meta.env.PUBLIC_ASSET_BASE = "https://blitzkit.github.io/assets-preview";
if (newTanks.length > 0) {
  notes += "## New Tanks\n\n";

  for (const tank of newTanks) {
    notes += `### [${tank.name.locales.en}](${domain}/tanks/${tank.slug})\n`;
    notes += `![](${tankIcon(tank.id)})\n\n`;
  }

  notes += "\n";
}

const changedTanks: [TankDefinition, TankDefinition][] = [];

for (const stringId in previewTankDefinitions.tanks) {
  const id = Number(stringId);

  if (newTanks.some((tank) => tank.id === id)) continue;

  const current = currentTankDefinitions.tanks[id];
  const preview = previewTankDefinitions.tanks[id];

  if (isEqual(current, preview)) continue;

  changedTanks.push([current, preview]);
}

changedTanks.sort((a, b) => b[1].tier - a[1].tier);

import.meta.env.PUBLIC_ASSET_BASE = "https://blitzkit.github.io/assets";
if (changedTanks.length > 0) {
  notes += "## Changed Tanks\n\n";

  for (const [current, preview] of changedTanks) {
    const currentTurret = current.turrets.at(-1)!;
    const previewTurret = preview.turrets.at(-1)!;
    const currentGun = currentTurret.guns.at(-1)!;
    const previewGun = previewTurret.guns.at(-1)!;
    const currentShell = currentGun.shells[0];
    const previewShell = previewGun.shells[0];
    const currentEngine = current.engines.at(-1)!;
    const previewEngine = preview.engines.at(-1)!;
    const currentTracks = current.tracks.at(-1)!;
    const previewTracks = preview.tracks.at(-1)!;
    const currentTankModel = currentModelDefinitions.models[current.id];
    const previewTankModel = previewModelDefinitions.models[preview.id];

    const currentConsumables = Object.values(
      currentConsumableDefinitions.consumables
    ).filter((consumable) =>
      checkConsumableProvisionInclusivity(consumable, current, currentGun)
    );
    const previewConsumables = Object.values(
      previewConsumableDefinitions.consumables
    ).filter((consumable) =>
      checkConsumableProvisionInclusivity(consumable, preview, previewGun)
    );
    const addedConsumables = previewConsumables.filter(
      (previewConsumable) =>
        !currentConsumables.some(
          (currentConsumable) => currentConsumable.id === previewConsumable.id
        )
    );
    const removedConsumables = currentConsumables.filter(
      (currentConsumable) =>
        !previewConsumables.some(
          (previewConsumable) => previewConsumable.id === currentConsumable.id
        )
    );

    const currentProvisions = availableProvisions(
      current,
      currentGun,
      currentProvisionDefinitions
    );
    const previewProvisions = availableProvisions(
      preview,
      previewGun,
      previewProvisionDefinitions
    );
    const addedProvisions = previewProvisions.filter(
      (previewProvision) =>
        !currentProvisions.some(
          (currentProvision) => currentProvision.id === previewProvision.id
        )
    );
    const removedProvisions = currentProvisions.filter(
      (currentProvision) =>
        !previewProvisions.some(
          (previewProvision) => previewProvision.id === currentProvision.id
        )
    );

    const currentEquipment = currentEquipmentDefinitions.presets[
      current.equipment_preset
    ].slots
      .map(({ left, right }) => [left, right])
      .flat();
    const previewEquipment = previewEquipmentDefinitions.presets[
      preview.equipment_preset
    ].slots
      .map(({ left, right }) => [left, right])
      .flat();
    const addedEquipment = previewEquipment
      .filter(
        (previewEquipment) =>
          !currentEquipment.some(
            (currentEquipment) => currentEquipment === previewEquipment
          )
      )
      .map((id) => previewEquipmentDefinitions.equipments[id]);
    const removedEquipment = currentEquipment
      .filter(
        (currentEquipment) =>
          !previewEquipment.some(
            (previewEquipment) => previewEquipment === currentEquipment
          )
      )
      .map((id) => currentEquipmentDefinitions.equipments[id]);

    const currentCharacteristics = tankCharacteristics(
      {
        tank: current,
        gun: currentGun,
        shell: currentShell,
        applyDynamicArmor: false,
        applyReactiveArmor: false,
        applySpallLiner: false,
        assaultDistance: 0,
        crewSkills: createDefaultSkills(currentSkillDefinitions),
        camouflage: true,
        consumables: [],
        engine: currentEngine,
        provisions: createDefaultProvisions(
          current,
          currentGun,
          currentProvisionDefinitions
        ),
        equipmentMatrix: genericDefaultEquipmentMatrix,
        stockEngine: current.engines[0],
        stockGun: current.turrets[0].guns[0],
        stockTrack: current.tracks[0],
        stockTurret: current.turrets[0],
        track: currentTracks,
        turret: currentTurret,
      },
      {
        equipmentDefinitions: currentEquipmentDefinitions,
        provisionDefinitions: currentProvisionDefinitions,
        tankModelDefinition: currentTankModel,
      }
    );
    const previewCharacteristics = tankCharacteristics(
      {
        tank: preview,
        gun: previewGun,
        shell: previewShell,
        applyDynamicArmor: false,
        applyReactiveArmor: false,
        applySpallLiner: false,
        assaultDistance: 0,
        crewSkills: createDefaultSkills(previewSkillDefinitions),
        camouflage: true,
        consumables: [],
        engine: previewEngine,
        provisions: createDefaultProvisions(
          preview,
          previewGun,
          previewProvisionDefinitions
        ),
        equipmentMatrix: genericDefaultEquipmentMatrix,
        stockEngine: preview.engines[0],
        stockGun: preview.turrets[0].guns[0],
        stockTrack: preview.tracks[0],
        stockTurret: preview.turrets[0],
        track: previewTracks,
        turret: previewTurret,
      },
      {
        equipmentDefinitions: previewEquipmentDefinitions,
        provisionDefinitions: previewProvisionDefinitions,
        tankModelDefinition: previewTankModel,
      }
    );
    const changedCharacteristics: string[] = [];

    for (const key in currentCharacteristics) {
      const characteristicKey = key as keyof typeof currentCharacteristics;
      if (
        currentCharacteristics[characteristicKey] !==
        previewCharacteristics[characteristicKey]
      ) {
        changedCharacteristics.push(characteristicKey);
      }
    }

    notes += `### [${preview.name.locales.en}](${domain}/tanks/${preview.slug})\n`;
    notes += `![](${tankIcon(preview.id)})\n\n`;

    if (addedConsumables.length + removedConsumables.length > 0) {
      notes += `Consumables: `;
      notes += [
        ...addedConsumables.map(
          (consumable) => `🟢 ${consumable.name.locales.en}`
        ),
        ...removedConsumables.map(
          (consumable) => `🔴 ${consumable.name.locales.en}`
        ),
      ].join(", ");
      notes += `\n`;
    }

    if (addedProvisions.length + removedProvisions.length > 0) {
      notes += `Provisions: `;
      notes += [
        ...addedProvisions.map(
          (provision) => `🟢 ${provision.name.locales.en}`
        ),
        ...removedProvisions.map(
          (provision) => `🔴 ${provision.name.locales.en}`
        ),
      ].join(", ");
      notes += `\n`;
    }

    if (addedEquipment.length + removedEquipment.length > 0) {
      notes += `-Equipment: `;
      notes += [
        ...addedEquipment.map((equipment) => `🟢 ${equipment.name.locales.en}`),
        ...removedEquipment.map(
          (equipment) => `🔴 ${equipment.name.locales.en}`
        ),
      ].join(", ");
      notes += `\n`;
    }

    if (changedCharacteristics.length > 0) {
      notes += `Characteristics:\n`;

      for (const characteristicUntyped of changedCharacteristics) {
        const characteristic =
          characteristicUntyped as keyof typeof currentCharacteristics;
        const name =
          strings.website.tools.tankopedia.characteristics.values[
            characteristic
          ];
        const before = currentCharacteristics[characteristic];
        const after = previewCharacteristics[characteristic];

        notes += `- ${
          typeof before === "number" && typeof after === "number"
            ? after > before
              ? "⬆️"
              : "🔻"
            : "✏️"
        } ${name}: \`${
          typeof before === "number" ? before.toFixed(2) : before
        }\` → \`${typeof after === "number" ? after.toFixed(2) : after}\`\n`;
      }
    }
  }
}

await writeFile("../../temp/patch-notes.md", notes);
