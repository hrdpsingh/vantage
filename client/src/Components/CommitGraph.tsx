import { Chart, LinearScale, LineElement, PointElement } from "chart.js";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

interface BarGraphProps {
  username: string;
  repository: string;
}

interface DataPoint {
  total: number;
  week: number;
}

Chart.register(LinearScale, PointElement, LineElement);

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

  const chartData = {
    labels: data.map((dictionary) => dictionary.week),
    datasets: [
      {
        label: "Commits",
        data: data.map((dictionary) => dictionary.total),
        tension: 0.2,
      },
    ],
  };

  return <Line data={chartData}></Line>;
}
