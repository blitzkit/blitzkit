import type { FC } from "react";
import { classNames } from "./classNames";

function composeRadixComponent<Props>(
  Component: FC<Props>,
  style: CSSModuleClasses[string],
) {
  return function (props: Props & { className?: string }) {
    return (
      <Component {...props} className={classNames(style, props.className)} />
    );
  };
}

export function composeRadixComponents<
  Components extends Record<string, unknown>,
>(components: Components, styles: CSSModuleClasses) {
  const mapped: Partial<Components> = {};

  for (const key in components) {
    const isMethod = key[0].toLowerCase() === key[0];

    if (isMethod) {
      mapped[key] = components[key];
      continue;
    }

    mapped[key] = composeRadixComponent(
      components[key] as FC,
      styles[key],
    ) as Components[Extract<keyof Components, string>];
  }

  return mapped as Components;
}
