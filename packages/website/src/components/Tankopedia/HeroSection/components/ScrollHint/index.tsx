import { Box } from "@radix-ui/themes";
import { Var } from "../../../../../core/radix/var";
import { Tankopedia } from "../../../../../stores/tankopedia";
import "./index.css";

export function ScrollHint() {
  const disturbed = Tankopedia.use((state) => state.disturbed);

  if (disturbed) return null;

  return (
    <Box
      position="absolute"
      bottom="0"
      mb="5"
      right="50%"
      height="2rem"
      width="1rem"
      style={{
        borderRadius: "0.5rem",
        outline: `2px solid ${Var("gray-11")}`,
        transform: "translateX(-50%)",
      }}
    >
      <Box
        className="scroll-hint"
        width="0.75rem"
        height="0.75rem"
        m="0.125rem"
        style={{
          borderRadius: "50%",
          backgroundColor: Var("gray-12"),
        }}
      />
    </Box>
  );
}
