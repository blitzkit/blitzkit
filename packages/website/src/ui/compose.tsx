import type { ComponentProps, ComponentType } from "react";
import { classNames } from "./classNames";

function composeRadixComponent<Props extends object>(
  Component: ComponentType<Props>,
  style: CSSModuleClasses[string],
  _props?: Partial<Props>,
) {
  return function (props: Props & { className?: string }) {
    return (
      <Component
        {..._props}
        {...props}
        className={classNames(style, props.className)}
      />
    );
  };
}

type ComponentKeys<T> = {
  [K in keyof T]: T[K] extends ComponentType<any> ? K : never;
}[keyof T];

type PickComponents<T> = Pick<T, ComponentKeys<T>>;

export function composeRadixComponents<Module extends Record<string, unknown>>(
  components: Module,
  styles: CSSModuleClasses,
  props: Partial<{
    [C in ComponentKeys<Module>]: ComponentProps<
      Extract<Module[C], ComponentType<any>>
    >;
  }> = {},
) {
  const mapped: Record<string, unknown> = {};
  const propsByName = props as Record<string, object | undefined>;

  for (const key in components) {
    if (key[0].toLowerCase() === key[0]) continue;

    mapped[key] = composeRadixComponent(
      components[key] as ComponentType<any>,
      styles[key],
      propsByName[key],
    );
  }

  return mapped as PickComponents<Module>;
}
