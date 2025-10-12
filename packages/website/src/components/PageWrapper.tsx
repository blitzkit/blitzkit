import { Flex, type FlexProps, Theme } from "@radix-ui/themes";
import type { ComponentProps } from "react";
import { NAVBAR_HEIGHT } from "../constants/navbar";
import type { RadixSize } from "../stores/embedState";
import { BlitzKitTheme } from "./BlitzKitTheme";

type PageWrapperProps = FlexProps & {
  color?: ComponentProps<typeof Theme>["accentColor"];
  containerProps?: ComponentProps<typeof Theme>;
  noFlex1?: boolean;
  padding?: RadixSize;
  noMinHeight?: boolean;
};

export function PageWrapper({
  style,
  color,
  children,
  noFlex1 = false,
  containerProps,
  noMinHeight = false,
  padding = "4",
  ...props
}: PageWrapperProps) {
  return (
    <BlitzKitTheme
      accentColor={color}
      style={{
        flex: noFlex1 ? undefined : 1,
        display: "flex",
        minHeight: noMinHeight
          ? "unset"
          : `calc(100svh - ${NAVBAR_HEIGHT}px - 7.75rem)`,
        flexDirection: "column",
        ...containerProps?.style,
      }}
      {...containerProps}
    >
      <Flex
        direction="column"
        gap="4"
        p={padding}
        width="100%"
        maxWidth="80rem"
        style={{
          margin: "auto",
          boxSizing: "border-box",
          flex: 1,
          ...style,
        }}
        {...props}
      >
        {children}
      </Flex>
    </BlitzKitTheme>
  );
}
