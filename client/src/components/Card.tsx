import type { ReactNode } from "react";

export function Card({
  children,
  elevated,
}: {
  children: ReactNode;
  elevated: boolean;
}) {
  return (
    <div>
      {elevated ? (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-4 w-fit h-fit">
          {children}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-950 border border-gray-800 p-4">
          {children}
        </div>
      )}
    </div>
  );
}
