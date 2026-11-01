import type { ReactNode } from "react";

interface Properties {
  children: ReactNode;
}

export function Card({ children }: Properties) {
  return (
    <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
      {children}
    </div>
  );
}
