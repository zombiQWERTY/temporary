import { ComponentPropsWithoutRef, ForwardedRef, forwardRef } from 'react';
import { Link } from './next';

type LinkBehaviourProps = ComponentPropsWithoutRef<typeof Link>;

export const LinkBehaviour = forwardRef<HTMLAnchorElement, LinkBehaviourProps>(
  function LinkBehaviour(props, ref: ForwardedRef<HTMLAnchorElement>) {
    return <Link ref={ref} {...props} />;
  },
);
