import { useRef, type ReactNode } from 'react';
import useMagnetic from '../../lib/useMagnetic';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: 'div' | 'span';
}

/**
 * Wraps children in a magnetic-hover container. Put a [data-magnetic-text]
 * element inside for the secondary inner parallax. Inline-block so it hugs
 * its content and can sit in flex/nav rows.
 */
export default function Magnetic({ children, className, strength, as = 'span' }: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  useMagnetic(ref, strength);

  const Tag = as as 'span';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform' }}
    >
      {children}
    </Tag>
  );
}
