import { RangeSlider } from "./RangeSlider";

interface ColorControllerRawProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ColorControllerRaw({
  value,
  onValueChange,
}: ColorControllerRawProps) {
  const tintString = value.slice(0, 7);
  const alphaString = value.slice(7, 9);
  const alpha = alphaString.length === 0 ? 255 : parseInt(alphaString, 16);

  return (
    <>
      <input
        type="color"
        value={value.slice(0, 7)}
        onChange={(event) => {
          let alpha = value.slice(7, 9);
          if (alpha.length === 0) alpha = "ff";
          onValueChange(`${event.target.value}${alpha}`);
        }}
      />
      <RangeSlider
        min={0}
        max={255}
        value={alpha}
        onValueChange={(value) => {
          onValueChange(`${tintString}${value.toString(16).padStart(2, "0")}`);
        }}
      />
    </>
  );
}
