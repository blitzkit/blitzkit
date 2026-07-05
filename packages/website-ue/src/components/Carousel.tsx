import { CaretLeftIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { type ReactNode } from "react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  options: ReactNode[];
}

export function Carousel({ value, onChange, options }: Props) {
  const isMin = value === 0;
  const isMax = value === options.length - 1;

  return (
    <div>
      <div
        data-disabled={isMin}
        onClick={() => {
          if (!isMin) onChange(value - 1);
        }}
      >
        <CaretLeftIcon />
      </div>

      <div>{options[value]}</div>

      <div
        data-disabled={isMax}
        onClick={() => {
          if (!isMax) onChange(value + 1);
        }}
      >
        <CaretRightIcon />
      </div>
    </div>
  );
}
