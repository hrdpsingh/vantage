import ClipLoader from "react-spinners/ClipLoader";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useFetch } from "../Helpers/useFetch";

interface BarGraphProps {
  username: string;
  repository: string;
}

interface DataPoint {
  total: number;
  week: number;
}

export function CommitGraph({ username, repository }: BarGraphProps) {
  const url = `http://127.0.0.1:8000/repository/${username}/${repository}/commit-history`;
  const data = useFetch<DataPoint[]>(username, repository, url);

  return (
    <div>
      {data ? (
        <div style={{ width: 600, height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="week"></XAxis>
              <YAxis></YAxis>
              <Bar dataKey="total" fill="#2196f3"></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </div>
  );
}
