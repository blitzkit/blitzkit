import { forwardRef, type ComponentProps } from "react";
import { Group } from "three";

export const ModelTankWrapper = forwardRef<Group, ComponentProps<"group">>(
  (props, ref) => {
    return <group rotation={[-Math.PI / 2, 0, 0]} ref={ref} {...props} />;
  }
);
