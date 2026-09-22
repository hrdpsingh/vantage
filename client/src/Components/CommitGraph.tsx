import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface BarGraphProps {
  username: string;
  repository: string;
}

interface DataPoint {
  total: number;
  week: number;
}

export function CommitGraph({ username, repository }: BarGraphProps) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    async function fetchCommitHistory() {
      const url = `http://127.0.0.1:8000/repository/${username}/${repository}/commit-history`;

      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    }

    fetchCommitHistory();
  }, [repository, username]);

  return (
    <div style={{ width: 600, height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="week"></XAxis>
          <YAxis></YAxis>
          <Bar dataKey="total" fill="#2196f3"></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
