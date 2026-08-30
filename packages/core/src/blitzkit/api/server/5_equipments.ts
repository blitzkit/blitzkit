import { EquipmentDefinitions, EquipmentSlot } from "@blitzkit/core";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI4 } from "./4_maps";

export abstract class ServerBlitzKitAPI5 extends ServerBlitzKitAPI4 {
  @Cache()
  async equipments() {
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
