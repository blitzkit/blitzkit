import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from "@radix-ui/react-icons";
import { Button, Flex, Table } from "@radix-ui/themes";
import { useLocale } from "../../hooks/useLocale";
import { TankPerformanceSort } from "../../stores/tankPerformanceSort";
import { TankPerformanceSortTypeNamesArray } from "../../stores/tankPerformanceSort/constants";
import { StickyColumnHeaderCell } from "../StickyColumnHeaderCell";

export function Header() {
  const sort = TankPerformanceSort.use();
  const { strings } = useLocale();

  return (
    <Table.Header>
      <Table.Row align="center">
        <StickyColumnHeaderCell>
          {strings.website.tools.performance.table.tanks.header}
        </StickyColumnHeaderCell>

        {TankPerformanceSortTypeNamesArray.map((type) => {
          const isSelected = sort.type === type;

          return (
            <StickyColumnHeaderCell
              px="2"
              key={type}
              width="0"
              justify="center"
            >
              <Flex align="center" gap="1">
                <Button
                  variant="ghost"
                  color={isSelected ? undefined : "gray"}
                  highContrast={!isSelected}
                  onClick={() => {
                    if (isSelected) {
                      TankPerformanceSort.mutate((draft) => {
                        draft.direction *= -1;
                      });
                    } else {
                      TankPerformanceSort.mutate((draft) => {
                        draft.type = type;
                        draft.direction = -1;
                      });
                    }
                  }}
                >
                  {strings.website.tools.performance.table.stats[type]}

                  {!isSelected && <CaretSortIcon />}
                  {isSelected && (
                    <>
                      {sort.direction === 1 && <CaretUpIcon />}
                      {sort.direction === -1 && <CaretDownIcon />}
                    </>
                  )}
                </Button>
              </Flex>
            </StickyColumnHeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
