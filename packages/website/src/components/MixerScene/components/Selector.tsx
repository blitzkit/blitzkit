import { Box, Flex, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Selector({ children }: Props) {
  return (
    <Flex align="center">
      <Box
        width="16rem"
        height="1px"
        style={{ backgroundColor: "var(--gray-12)" }}
      />
      <Box
        style={{
          padding: "var(--space-3)",
          backgroundColor: "var(--gray-3)",
          borderRadius: "var(--radius-3)",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <Text style={{ whiteSpace: "nowrap" }}>{children}</Text>
      </Box>
    </Flex>
  );
}
