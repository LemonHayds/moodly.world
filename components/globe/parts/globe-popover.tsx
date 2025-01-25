"use client";

interface GlobePopoverProps {
  countryName: string;
  position: { x: number; y: number };
}

export function GlobePopover({ countryName, position }: GlobePopoverProps) {
  if (position.x <= 0 || position.y <= 0) return null;

  return (
    <div
      className="fixed pointer-events-none bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-sm select-none rounded border border-border text-black dark:text-white px-2 py-1 shadow-lg"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, 20px)`,
        zIndex: 1000,
      }}
    >
      <div className="font-medium">{countryName}</div>
    </div>
  );
}
