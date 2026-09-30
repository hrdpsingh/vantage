import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-lg bg-blue-50 border border-gray-400 p-4">
      {children}
    </div>
  );
}
