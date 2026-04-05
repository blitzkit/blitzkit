import type { ComponentProps } from "react";

export function EqualIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1.5 5C1.22386 5 1 5.22386 1 5.5C1 5.77614 1.22386 6 1.5 6H13.5C13.7761 6 14 5.77614 14 5.5C14 5.22386 13.7761 5 13.5 5H1.5ZM1 9.5C1 9.22386 1.22386 9 1.5 9H13.5C13.7761 9 14 9.22386 14 9.5C14 9.77614 13.7761 10 13.5 10H1.5C1.22386 10 1 9.77614 1 9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
