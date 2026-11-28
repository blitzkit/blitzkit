import { Slider } from "../../Slider";
import styles from "./index.module.css";

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onValueChange(value: number): void;
}

export function RangeSlider({
  min,
  max,
  value,
  onValueChange,
}: RangeSliderProps) {
  return (
    <Slider.Root
      className={styles.root}
      min={min}
      max={max}
      value={[value]}
      onValueChange={([value]) => onValueChange(value)}
    >
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb />
    </Slider.Root>
  );
}
