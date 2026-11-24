type MobileSeamFadeProps = {
  /** Which edge of the parent section the fade sits on. */
  edge: 'top' | 'bottom';
  /** Colour to blend into at that edge (the neighbouring section's background). */
  color: string;
  /** Height of the fade in px. */
  height?: number;
  /** Extra classes, e.g. a z-index that sits above the background but below content. */
  className?: string;
};

/**
 * Mobile-only gradient strip that softens the hard colour break between two
 * stacked sections. Hidden from `md` up so the desktop layout is unchanged.
 * The parent section must be `relative`.
 */
export default function MobileSeamFade({ edge, color, height = 160, className = '' }: MobileSeamFadeProps) {
  return (
    <div
      aria-hidden
      className={`md:hidden absolute inset-x-0 ${edge === 'top' ? 'top-0' : 'bottom-0'} pointer-events-none ${className}`}
      style={{
        height,
        background: `linear-gradient(to ${edge === 'top' ? 'bottom' : 'top'}, ${color}, transparent)`,
      }}
    />
  );
}
