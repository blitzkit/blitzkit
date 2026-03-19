import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface TextFieldProps extends ComponentProps<"input"> {
  children?: ReactNode;
  align?: "left" | "center" | "right";
  monospace?: boolean;
  autoWidth?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      children,
      className,
      monospace,
      autoWidth,
      placeholder,
      align,
      disabled,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const input = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        if (autoWidth && input.current) {
          input.current.style.width = `${event.target.value.length || event.target.placeholder.length}ch`;
        }

        onChange?.(event);
      },
      [onChange],
    );

    useImperativeHandle(ref, () => input.current!, []);

    return (
      <div
        {...props}
        className={classNames("text-field", className)}
        data-has-icon={children !== undefined}
        data-disabled={disabled}
      >
        {children}
        <input
          data-align={align === "left" ? undefined : align}
          data-monospace={monospace}
          disabled={disabled}
          ref={input}
          onChange={handleChange}
          placeholder={placeholder}
          value={value}
          style={{
            width: `${value?.toString().length || placeholder?.length || 0}ch`,
          }}
        />
      </div>
    );
  },
);
