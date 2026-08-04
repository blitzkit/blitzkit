import { EquipmentDefinitions, EquipmentSlot } from "@blitzkit/core";
import { Cache } from "@blitzkit/core/src/blitzkit/api/server/0";
import { ServerBlitzKitAPI4 } from "@blitzkit/core/src/blitzkit/api/server/4";

export abstract class ServerBlitzKitAPI5 extends ServerBlitzKitAPI4 {
  @Cache()
  async equipmentDefinitions() {
    const equipmentDefinitions = EquipmentDefinitions.create();

    Object.entries(this.optionalDevices!.root).forEach(
      ([optionalDeviceKey, optionalDeviceEntry]) => {
        if (optionalDeviceKey === "nextAvailableId") return;

        equipmentDefinitions.equipments[optionalDeviceEntry.id] = {
          name: this.getString(optionalDeviceEntry.userString),
          description: this.getString(optionalDeviceEntry.description),
        };
      },
    );

    Object.entries(this.optionalDeviceSlots!.root.presets).forEach(
      ([optionalDeviceSlotKey, optionalDeviceSlotEntry]) => {
        if (optionalDeviceSlotKey === "emptyPreset") return;

        equipmentDefinitions.presets[optionalDeviceSlotKey] = {
          slots: Object.values(optionalDeviceSlotEntry)
            .map((level) => {
              return Object.values(level).map((options) => {
                return {
                  left: this.optionalDevices!.root[options.device0].id,
                  right: this.optionalDevices!.root[options.device1].id,
                } satisfies EquipmentSlot;
              });
            })
            .flat(),
        };
      },
    );

    return equipmentDefinitions;
  }
}
