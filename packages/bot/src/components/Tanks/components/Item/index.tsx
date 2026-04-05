import { TankClass, TankType, TREE_TYPE_ICONS } from "@blitzkit/core";
import { theme } from "../../../../stitches.config";

export interface ItemProps {
  tankClass?: TankClass;
  name: string;
  tankType: TankType;
}

const TREE_TYPE_COLOR = {
  [TankType.TANK_TYPE_RESEARCHABLE]: "",
  [TankType.TANK_TYPE_PREMIUM]: "_amber",
  [TankType.TANK_TYPE_COLLECTOR]: "_blue",
} as const;

export function Item({
  tankClass: tankType,
  name,
  tankType: treeType,
}: ItemProps) {
  return (
    <div
      style={{
        display: "flex",
        height: 32,
        paddingLeft: 8,
        paddingRight: 8,
        overflow: "hidden",
        alignItems: "center",
        borderRadius: 4,
        backgroundColor:
          theme.colors[`componentInteractive${TREE_TYPE_COLOR[treeType]}`],
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 4,
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          overflow: "hidden",
        }}
      >
        {tankType && (
          <img
            alt={TankType[tankType]}
            src={TREE_TYPE_ICONS[treeType][tankType]}
            style={{ width: 14, height: 14 }}
          />
        )}
        <span
          style={{
            fontSize: 16,
            whiteSpace: "nowrap",
            color: theme.colors[`textLowContrast${TREE_TYPE_COLOR[treeType]}`],
          }}
        >
          {name}
        </span>
      </div>

      {/* {image && (
        // TODO: remove hardcoded dimensions when satori fixes non-width unloadable images
        <img
          alt={name}
          src={image}
          width={106}
          height={32}
          style={{ objectFit: 'cover' }}
        />
      )} */}
    </div>
  );
}
