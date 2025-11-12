import {
  availableProvisions,
  fetchConsumableDefinitions,
  fetchEquipmentDefinitions,
  fetchProvisionDefinitions,
  fetchTankDefinitions,
  TankDefinition,
} from "@blitzkit/core";
import { checkConsumableProvisionInclusivity } from "@blitzkit/core/src/blitzkit/checkConsumableProvisionInclusivity";
import { writeFile } from "fs/promises";
import { isEqual } from "lodash-es";

const domain = "https://opentest.blitzkit.app";

import.meta.env.PUBLIC_ASSET_BASE = "https://blitzkit.github.io/assets";
const currentTankDefinitions = await fetchTankDefinitions();
const currentConsumableDefinitions = await fetchConsumableDefinitions();
const currentProvisionDefinitions = await fetchProvisionDefinitions();
const currentEquipmentDefinitions = await fetchEquipmentDefinitions();

import.meta.env.PUBLIC_ASSET_BASE = "https://blitzkit.github.io/assets-preview";
const previewTankDefinitions = await fetchTankDefinitions();
const previewConsumableDefinitions = await fetchConsumableDefinitions();
const previewProvisionDefinitions = await fetchProvisionDefinitions();
const previewEquipmentDefinitions = await fetchEquipmentDefinitions();

let notes = "# BlitzKit OpenTest Patch Notes\n\n";

const newTanks: TankDefinition[] = [];

for (const id in previewTankDefinitions.tanks) {
  if (!(id in currentTankDefinitions.tanks)) {
    newTanks.push(previewTankDefinitions.tanks[id]);
  }
}

newTanks.sort((a, b) => b.tier - a.tier);

if (newTanks.length > 0) {
  notes += "## New Tanks\n\n";

  for (const tank of newTanks) {
    notes += `- [${tank.name.locales.en}](${domain}/tanks/${tank.slug})\n`;
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

if (changedTanks.length > 0) {
  notes += "## Changed Tanks\n\n";

  for (const [current, preview] of changedTanks) {
    const currentTurret = current.turrets.at(-1)!;
    const previewTurret = preview.turrets.at(-1)!;
    const currentGun = currentTurret.guns.at(-1)!;
    const previewGun = previewTurret.guns.at(-1)!;

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

    // notes += `- [${preview.name.locales.en}](${domain}/tanks/${preview.slug})\n`;
    notes += `- ${preview.name.locales.en}\n`;

    if (addedConsumables.length + removedConsumables.length > 0) {
      notes += `  - Consumables: `;
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
      notes += `  - Provisions: `;
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
      notes += `  - Equipment: `;
      notes += [
        ...addedEquipment.map((equipment) => `🟢 ${equipment.name.locales.en}`),
        ...removedEquipment.map(
          (equipment) => `🔴 ${equipment.name.locales.en}`
        ),
      ].join(", ");
      notes += `\n`;
    }
  }
}

await writeFile("../../temp/patch-notes.md", notes);
