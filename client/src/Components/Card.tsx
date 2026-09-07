import type { ReactNode } from "react";

interface CardProps {
  content: ReactNode;
}

export function Card({ content }: CardProps) {
  return (
    <div className="rounded-lg bg-blue-50 border border-gray-400 p-4">
      {content}
    </div>
  );
}
