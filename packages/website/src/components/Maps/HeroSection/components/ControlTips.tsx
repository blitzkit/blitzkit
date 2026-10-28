import { Card, Flex, Kbd, Text } from "@radix-ui/themes";
import { Maps } from "../../../../stores/maps";

const CONTROL_TIPS = [
  { keys: ["Left drag"], action: "Rotate" },
  { keys: ["Right drag"], action: "Look around" },
  { keys: ["Scroll"], action: "Zoom" },
  { keys: ["W", "A", "S", "D"], action: "Move" },
  { keys: ["Q", "E"], action: "Down / up" },
  { keys: ["Shift"], action: "Faster" },
  { keys: ["Gizmo"], action: "Snap to axis" },
];

export function ControlTips() {
  const disturbed = Maps.use((state) => state.disturbed);

  return (
    <Flex
      position="absolute"
      bottom="4"
      right="4"
      style={{
        pointerEvents: "none",
        opacity: disturbed ? 1 : 0,
        visibility: disturbed ? "visible" : "hidden",
        transition: "opacity 1s, visibility 1s",
      }}
    >
      <Card style={{ pointerEvents: "auto" }}>
        <Flex gap="4" wrap="wrap" justify="center">
          {CONTROL_TIPS.map(({ keys, action }) => (
            <Flex key={action} gap="1" align="center">
              {keys.map((key) => (
                <Kbd key={key} size="1">
                  {key}
                </Kbd>
              ))}
              <Text size="1" color="gray">
                {action}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Card>
    </Flex>
  );
}
