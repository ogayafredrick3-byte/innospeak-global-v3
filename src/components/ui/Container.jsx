import { forwardRef } from 'react';

/**
 * Container — centered, responsive max-width wrapper.
 * Uses the shared `.container-px` utility so spacing stays consistent
 * across every section of the site.
 */
const Container = forwardRef(function Container(
  { as: Component = 'div', className = '', children, ...props },
  ref
) {
  return (
    <Component ref={ref} className={`container-px ${className}`} {...props}>
      {children}
    </Component>
  );
});

export default Container;
