import type { ReactNode } from "react";

interface Properties {
  children: ReactNode;
}

export function Pill({ children }: Properties) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-700">{children}</span>
    </div>
  );
}
