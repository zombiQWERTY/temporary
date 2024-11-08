import * as React from 'react';
import { SVGProps } from 'react';

export const SvgError = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 10 10"
    width={10}
    height={10}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9 9 5 5m0 0L1 1m4 4 4-4M5 5 1 9"
      stroke="#FF4040"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
