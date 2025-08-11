import type { ComponentProps } from 'react';

export function ShellBorder(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="159"
      height="60"
      viewBox="0 0 159 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M149.917 7.5L151.5 9.91406V50.085L149.917 52.5H134.674C133.504 51.6657 132.116 51.1813 130.673 51.1133L130.319 51.1045H93.085C91.8919 51.1046 90.7173 51.3895 89.6582 51.9336L89.4482 52.0459L88.6494 52.4883C48.806 52.0806 22.9344 39.046 11.1416 30C22.9344 20.954 48.806 7.91846 88.6494 7.51074L89.4482 7.9541C90.5611 8.57122 91.8125 8.89543 93.085 8.89551H130.319C131.888 8.89551 133.409 8.40216 134.674 7.5H149.917Z"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinejoin="round"
      />
    </svg>
  );
}
