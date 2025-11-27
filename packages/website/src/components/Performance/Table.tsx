import { Flex } from "@radix-ui/themes";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { StickyTableRoot } from "../StickyTableRoot";
import { Header } from "./Header";
import { Tanks } from "./Tanks";

export function TankTable({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <Flex justify="center" maxWidth="100%" flexGrow="1" position="relative">
      <StickyTableRoot
        size={{ initial: "1", sm: "2" }}
        variant="surface"
        style={{
          position: "absolute",
          maxWidth: "100%",
          maxHeight: "100%",
          height: "100%",
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <Header />
        <Tanks skeleton={skeleton} />
      </StickyTableRoot>
    </Flex>
  );
}
