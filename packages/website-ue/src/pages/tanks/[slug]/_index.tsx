import {
  TankAttributeChange_AttributeName,
  TankAttributeChange_Modifier,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { use } from "react";
import { api } from "../../../core/api/dynamic";
import { Tankopedia } from "../../../stores/tankopedia";

interface Props {
  id: string;
}

export function Page({ id }: Props) {
  const tank = use(api.tank(id));

  const stage = Tankopedia.use((state) => state.stage);

  return (
    <>
      <h1>{tank.name?.value}</h1>

      <h2>Base stats</h2>

      {tank.base_stats!.attributes.map((attribute) => (
        <p>
          {TankAttributeChange_AttributeName[attribute.attribute_name]}:{" "}
          {attribute.value} ({TankAttributeChange_Modifier[attribute.modifier]})
        </p>
      ))}

      <h2>Upgrades</h2>

      {tank.upgrade_stages.map((stage, index) => (
        <>
          <h3>Stage {index}</h3>

          {stage.attributes.map((attribute) => (
            <p>
              {TankAttributeChange_AttributeName[attribute.attribute_name]}:{" "}
              {attribute.value} (
              {TankAttributeChange_Modifier[attribute.modifier]})
            </p>
          ))}
        </>
      ))}
    </>
  );
}
