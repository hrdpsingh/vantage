import { ClipLoader } from "react-spinners";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { Card } from "../components/Card";

interface WeeklyCommits {
  index: number;
  commits: number;
}

export function CommitActivity({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/commit-activity`;
  const data = useFetch<WeeklyCommits[]>(url, true);

  return (
    <Card elevated={true}>
      <h2 className="text-2xl font-bold">Commit Activity</h2>
      {data ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ bottom: 20, left: 20, top: 20, right: 20 }}
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3340d4" stopOpacity={0.6}></stop>
                <stop
                  offset="100%"
                  stopColor="#3340d4"
                  stopOpacity={0.2}
                ></stop>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="index"
              label={{ value: "Weeks", position: "bottom", fill: "#94a3b8" }}
              tick={{ fill: "#94a3b8" }}
              tickLine={{ stroke: "#94a3b8" }}
              interval={1}
            ></XAxis>
            <YAxis
              tick={{ fill: "#94a3b8" }}
              tickLine={{ stroke: "#94a3b8" }}
              label={{
                value: "Commits",
                angle: -90,
                position: "left",
                textAnchor: "middle",
                fill: "#94a3b8",
              }}
            ></YAxis>
            <Area
              dataKey="commits"
              type="monotone"
              stroke="#3340d4"
              fill="url(#gradient)"
            ></Area>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                return (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
                    <span>
                      {payload[0].name.toString().charAt(0).toUpperCase() +
                        payload[0].name.toString().slice(1)}
                      :{" "}
                    </span>
                    {payload[0].value}
                  </div>
                );
              }}
            ></Tooltip>
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </Card>
  );
}
