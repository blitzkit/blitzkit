import type { ComponentProps } from "react";

export function TankIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      width="64"
      height="48"
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M63 14.3344H42.7572M58.2615 31.6656C58.2615 37.0758 53.8954 38 48.5095 38H11.752C6.36612 38 2 37.0758 2 31.6656C2 26.2555 6.36612 21.8697 11.752 21.8697H23.8795V17.7959C23.8795 12.3858 28.2456 8 33.6315 8C39.0174 8 43.3835 12.3858 43.3835 17.7959V21.8697H48.5095C53.8954 21.8697 58.2615 26.2555 58.2615 31.6656Z"
        stroke="currentColor"
        stroke-width="4"
      />
    </svg>
  );
}
