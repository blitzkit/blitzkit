import { alias, formatCompact } from "@blitzkit/core";
import {
  AugmentNodeType,
  type AugmentGroup,
  type AugmentNode,
  type AugmentProgression,
} from "@blitzkit/protos";
import {
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
  LightningBoltIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import { useCallback, useMemo } from "react";
import { useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { layoutAugmentTree } from "../../tankopedia/augmentTreeLayout";
import { AUGMENT_GROUP_ID } from "../../tankopedia/augments";
import { classNames } from "../../ui/classNames";
import { IconButton } from "../IconButton";
import { LoadoutSection } from "../LoadoutSection";
import shared from "../LoadoutTree/index.module.css";
import { Text } from "../Text";
import styles from "./index.module.css";

interface AugmentIconProps {
  icon?: string;
  isCommon: boolean;
}

function AugmentIcon({ icon, isCommon }: AugmentIconProps) {
  if (icon !== undefined) {
    return (
      <img
        alt=""
        src={alias("api", `/icons/augments/${icon}.webp`)}
        className={shared.icon}
      />
    );
  }

  return isCommon ? (
    <StarFilledIcon className={shared.icon} />
  ) : (
    <LightningBoltIcon className={shared.icon} />
  );
}

interface PriceProps {
  xp: number;
}

function Price({ xp }: PriceProps) {
  const locale = useLocale();

  if (xp <= 0) return null;

  return (
    <div className={shared.price}>
      <Text size="minor">{formatCompact(locale, xp)}</Text>
      <img alt="xp" src={alias("api", "/icons/currencies/xp.webp")} />
    </div>
  );
}

interface AugmentButtonProps {
  node: AugmentNode;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

function AugmentButton({ node, isSelected, onToggle }: AugmentButtonProps) {
  const isCommon = node.type === AugmentNodeType.AUGMENT_NODE_TYPE_COMMON;
  const handleClick = useCallback(() => onToggle(node.id), [onToggle, node]);

  return (
    <IconButton
      radius="1"
      size="major"
      variant={isSelected ? "surface" : "soft"}
      color={isSelected ? (isCommon ? undefined : "amber") : "gray"}
      className={shared.node}
      data-notable={!isCommon}
      onClick={handleClick}
    >
      <AugmentIcon
        icon={node.attributes.find((attribute) => attribute.icon)?.icon}
        isCommon={isCommon}
      />
      <Price xp={node.xp_cost} />
    </IconButton>
  );
}

interface GroupButtonProps {
  group: AugmentGroup;
  // One of its alternatives is installed
  isSelected: boolean;
  onToggle: (id: number) => void;
}

// Where the branches meet; the choice itself hangs below
function GroupButton({ group, isSelected, onToggle }: GroupButtonProps) {
  const handleClick = useCallback(() => onToggle(AUGMENT_GROUP_ID), [onToggle]);

  return (
    <IconButton
      radius="1"
      size="major"
      variant={isSelected ? "surface" : "soft"}
      color={isSelected ? "amber" : "gray"}
      className={shared.node}
      data-notable
      onClick={handleClick}
    >
      <AugmentIcon icon={group.icon} isCommon={false} />
      <Price xp={group.xp_cost} />
    </IconButton>
  );
}

interface ContentProps {
  progression: AugmentProgression;
  selected: number[];
  onToggle: (id: number) => void;
}

function Content({ progression, selected, onToggle }: ContentProps) {
  const { group } = progression;
  const installed = useMemo(() => new Set(selected), [selected]);
  const isGroupSelected =
    group?.alternatives.some(({ id }) => installed.has(id)) ?? false;
  const { cells, columns, rows } = useMemo(
    () => layoutAugmentTree(progression),
    [progression],
  );

  return (
    <div
      className={classNames(shared.tree, styles.tree)}
      style={{
        gridTemplateColumns: `repeat(${columns}, auto)`,
        gridTemplateRows: `repeat(${rows}, auto) auto`,
      }}
    >
      {cells.map((cell) => (
        <div
          key={`${cell.row},${cell.column}`}
          className={classNames(shared.cell, styles.cell)}
          data-node={cell.node !== undefined || cell.group !== undefined}
          style={{ gridColumn: cell.column, gridRow: cell.row }}
        >
          {cell.north && <span className={styles.north} />}
          {cell.south && <span className={styles.south} />}
          {cell.west && <span className={styles.west} />}
          {cell.east && <span className={styles.east} />}

          {cell.node && (
            <AugmentButton
              node={cell.node}
              isSelected={installed.has(cell.node.id)}
              onToggle={onToggle}
            />
          )}

          {cell.group && (
            <GroupButton
              group={cell.group}
              isSelected={isGroupSelected}
              onToggle={onToggle}
            />
          )}
        </div>
      ))}

      {group !== undefined && (
        // The mutually exclusive choice, hanging below the cell that leads in
        <div className={styles.alternatives} style={{ gridRow: rows + 1 }}>
          {group.alternatives.map((node) => (
            <AugmentButton
              key={node.id}
              node={node}
              isSelected={installed.has(node.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LoadoutAugmentsProps {
  progression: AugmentProgression;
  selected: number[];
  onToggle: (id: number) => void;
  onStock: () => void;
  onMaximize: () => void;
}

export function LoadoutAugments({
  progression,
  selected,
  onToggle,
  onStock,
  onMaximize,
}: LoadoutAugmentsProps) {
  const strings = useStrings();

  return (
    <LoadoutSection
      title={strings.tanks.loadout.augments}
      actions={
        <>
          <IconButton
            highContrast
            color="gray"
            size="minor"
            variant="ghost"
            onClick={onStock}
          >
            <DoubleArrowUpIcon />
          </IconButton>

          <IconButton
            highContrast
            color="gray"
            size="minor"
            variant="ghost"
            onClick={onMaximize}
          >
            <DoubleArrowDownIcon />
          </IconButton>
        </>
      }
    >
      <Content
        progression={progression}
        selected={selected}
        onToggle={onToggle}
      />
    </LoadoutSection>
  );
}
