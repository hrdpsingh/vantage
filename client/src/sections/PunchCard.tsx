import { ClipLoader } from "react-spinners";
import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";

interface PunchCardItem {
  day: number;
  hour: number;
  commits: number;
}

function normalizeMatrix(matrix: number[][]): number[][] {
  const values = matrix.flat();
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (minimum === maximum) {
    matrix.map((row) => row.map(() => 0));
  }

  return matrix.map((row) =>
    row.map((value) => (value - minimum) / (maximum - minimum)),
  );
}

export function PunchCard({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/punch-card`;
  const data = useFetch<PunchCardItem[]>(username, repository, url);

  const matrix: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );

  if (data) {
    for (const item of data) {
      matrix[item.day][item.hour] = item.commits;
    }
  }

  const normalizedMatrix: number[][] = normalizeMatrix(matrix);

  return (
    <div>
      {data ? (
        <div className="grid grid-cols-24 gap-1">
          {normalizedMatrix.flat().map((value, i) => (
            <div
              key={i}
              className="h-4 w-4 bg-blue-500"
              style={{ opacity: value }}
            ></div>
          ))}
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
