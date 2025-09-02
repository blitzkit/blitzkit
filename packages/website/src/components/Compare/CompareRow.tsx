import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { Flex, IconButton, Table, Text } from "@radix-ui/themes";
import { useRef } from "react";
import type { TankCharacteristics } from "../../core/blitzkit/tankCharacteristics";
import { Var } from "../../core/radix/var";
import { useLocale } from "../../hooks/useLocale";
import { CompareEphemeral } from "../../stores/compareEphemeral";
import { ComparePersistent } from "../../stores/comparePersistent";
import { StickyRowHeaderCell } from "../StickyRowHeaderCell";

type CompareRowProps = {
  display?: (
    member: Awaited<TankCharacteristics>
  ) => number | string | undefined;
  deltaType?: "higherIsBetter" | "lowerIsBetter";
  decimals?: number;
  deltaNominalDisplay?: (delta: number) => string | number;
  indent?: boolean;
  stats: TankCharacteristics[];
} & (
  | {
      name: string;
      value: (member: TankCharacteristics) => number | undefined;
    }
  | {
      value: keyof TankCharacteristics;
    }
);

export function CompareRow({
  display,
  deltaType = "higherIsBetter",
  decimals,
  deltaNominalDisplay,
  indent,
  stats,
  ...props
}: CompareRowProps) {
  const { strings } = useLocale();
  const sorting = CompareEphemeral.use((state) => state.sorting);
  const deltaMode = ComparePersistent.use((state) => state.deltaMode);
  const values = stats.map((stat) =>
    typeof props.value === "function"
      ? props.value(stat)!
      : (stat[props.value] as number)
  );
  const id = useRef(Math.random());
  const name =
    typeof props.value === "string"
      ? strings.website.tools.tankopedia.characteristics.values[props.value]
      : props.name;

  return (
    <Table.Row>
      <StickyRowHeaderCell>
        <Flex
          align="center"
          style={{ whiteSpace: "nowrap" }}
          gap={indent ? { initial: "4", sm: "6" } : { initial: "1", sm: "2" }}
        >
          <IconButton
            color={sorting?.by === id.current ? undefined : "gray"}
            variant="ghost"
            onClick={() => {
              CompareEphemeral.mutate((draft) => {
                draft.members.sort((memberA, memberB) => {
                  const indexA = draft.members.indexOf(memberA);
                  const indexB = draft.members.indexOf(memberB);
                  const valueA = values[indexA];
                  const valueB = values[indexB];

                  return draft.sorting?.direction === "ascending" &&
                    draft.sorting.by === id.current
                    ? valueA - valueB
                    : valueB - valueA;
                });

                draft.sorting = {
                  by: id.current,
                  direction:
                    draft.sorting?.direction === "ascending" &&
                    draft.sorting.by === id.current
                      ? "descending"
                      : "ascending",
                };
              });
            }}
          >
            {(sorting === undefined || sorting.by !== id.current) && (
              <CaretSortIcon style={{ transform: "rotate(90deg)" }} />
            )}
            {sorting?.by === id.current && (
              <>
                {sorting.direction === "ascending" && <CaretRightIcon />}
                {sorting.direction === "descending" && <CaretLeftIcon />}
              </>
            )}
          </IconButton>

          <Text size={{ initial: "1", sm: "2" }}>{name}</Text>
        </Flex>
      </StickyRowHeaderCell>

      {values.map((value, index) => {
        const delta = value - values[0];
        const deltaPercentage = value / values[0] - 1;
        const normalizedDeltaPercentage = Math.round(
          Math.min(100, Math.abs(deltaPercentage) * 2 * 100 + 25)
        );
        const resolvedDisplayValue = display
          ? display(stats[index])
          : decimals === undefined
            ? value
            : value?.toFixed(decimals);

        return (
          <Table.Cell
            key={index}
            style={{
              backgroundColor:
                index === 0 ||
                value === undefined ||
                values[0] === undefined ||
                value === values[0]
                  ? undefined
                  : (
                        deltaType === "higherIsBetter"
                          ? value > values[0]
                          : value < values[0]
                      )
                    ? `color-mix(in srgb, ${Var("green-7")} ${normalizedDeltaPercentage}%, ${Var("green-3")})`
                    : `color-mix(in srgb, ${Var("red-7")} ${normalizedDeltaPercentage}%, ${Var("red-3")})`,
            }}
          >
            <Flex
              align="center"
              justify="center"
              gap="2"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Text style={{ textAlign: "center" }} wrap="nowrap">
                {resolvedDisplayValue}
              </Text>

              {delta !== 0 &&
                resolvedDisplayValue !== undefined &&
                values[0] !== undefined && (
                  <>
                    {deltaMode === "absolute" && (
                      <Text color="gray">
                        (
                        {`${delta > 0 ? "+" : ""}${
                          deltaNominalDisplay
                            ? deltaNominalDisplay(delta)
                            : decimals === undefined
                              ? delta
                              : delta.toFixed(decimals)
                        }`}
                        )
                      </Text>
                    )}

                    {deltaMode === "percentage" && (
                      <Text color="gray">
                        (
                        {`${deltaPercentage > 0 ? "+" : ""}${Math.round(
                          deltaPercentage * 100
                        )}%`}
                        )
                      </Text>
                    )}
                  </>
                )}
            </Flex>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}
