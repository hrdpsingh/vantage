import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { useFetch } from "../hooks/useFetch";
import { ClipLoader } from "react-spinners";
import type { Details } from "../types/repository";

interface Languages {
  language: number;
}

export function Languages({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/repository/${username}/${repository}/commit-patterns`;
  const data = useFetch<Languages>(username, repository, url);

  let transformedData;
  if (data) {
    transformedData = Object.entries(data).map(([key, value]) => ({
      name: key,
      value: value,
    }));
  }

  return (
    <div>
      {data ? (
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={transformedData} dataKey="value"></Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
