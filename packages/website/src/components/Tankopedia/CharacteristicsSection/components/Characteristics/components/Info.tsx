import { CaretDownIcon, CaretUpIcon } from "@radix-ui/react-icons";
import { Box, Flex, Text } from "@radix-ui/themes";
import fuzzysort from "fuzzysort";
import { Quicklime } from "quicklime";
import { useEffect, useRef, type ReactNode } from "react";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { Mark } from "../../../../../Mark";

export const highlightedRows = new Set<HTMLDivElement>();
export const highlightedRowsUpdate = new Quicklime();

export interface InfoProps {
  name: ReactNode;
  children?: ReactNode;
  indent?: boolean;
  delta?: number;
  decimals?: number;
  prefix?: string;
  deltaType?: "higherIsBetter" | "lowerIsBetter";
}

export function Info({
  name,
  children,
  indent = false,
  delta,
  decimals,
  prefix,
  deltaType = "higherIsBetter",
}: InfoProps) {
  const statSearch = Tankopedia.use((state) => state.statSearch);
  const container = useRef<HTMLDivElement>(null);

  let label = name;
  let highlighted = false;

  if (statSearch !== undefined && typeof name === "string") {
    const result = fuzzysort.single(statSearch, name);

    if (result) {
      label = fuzzysort.highlight(result, (match, index) => (
        <Mark key={index}>{match}</Mark>
      ));
      highlighted = true;
    }
  }

  useEffect(() => {
    if (!container.current) return;

    if (highlighted) {
      highlightedRows.add(container.current);
      highlightedRowsUpdate.dispatch();
    }

    return () => {
      highlightedRows.delete(container.current!);
      highlightedRowsUpdate.dispatch();
    };
  });

  return (
    <Flex
      align="center"
      pl={indent ? "2" : "0"}
      width="100%"
      gap="4"
      ref={container}
    >
      <Text color="gray">{label}</Text>

      <Box flexGrow="1" />

      {children !== undefined && (
        <Flex align="center" gap="1">
          {delta !== undefined && delta !== 0 && !isNaN(delta) && (
            <>
              <Text
                color={
                  delta * (deltaType === "lowerIsBetter" ? -1 : 1) > 0
                    ? "green"
                    : "tomato"
                }
              >
                {decimals !== undefined
                  ? Math.abs(delta).toFixed(decimals)
                  : Math.abs(delta)}
              </Text>
              <Text
                color={
                  delta * (deltaType === "lowerIsBetter" ? -1 : 1) > 0
                    ? "green"
                    : "tomato"
                }
              >
                {delta > 0 ? <CaretUpIcon /> : <CaretDownIcon />}
              </Text>
            </>
          )}

          <Text>
            {prefix !== undefined && (
              <Text color="gray" size="1">
                {prefix}
              </Text>
            )}

            {decimals !== undefined && typeof children === "number"
              ? children.toFixed(decimals)
              : children}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
