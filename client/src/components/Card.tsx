import type { ReactNode } from "react";

interface Properties {
  children: ReactNode;
}

export function Card({ children }: Properties) {
  return (
    <div className="rounded-lg bg-gray-950 border border-gray-800 p-4">
      {children}
    </div>
  );
}
