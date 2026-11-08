import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useFetch } from "../hooks/useFetch";
import { ClipLoader } from "react-spinners";
import type { Details } from "../types/repository";
import { Card } from "../components/Card";

interface Data {
  language: number;
}

export function Languages({ username, repository }: Details) {
  const url = `http://127.0.0.1:8000/${username}/${repository}/languages`;
  const data = useFetch<Data>(url, false);

  let transformedData;

  const colors = [
    "#e0db3d",
    "#4e7cbf",
    "#de002c",
    "#56bf4e",
    "#e03dbd",
    "#e0943d",
  ];

  if (data) {
    transformedData = Object.entries(data).map(([key, value], index) => ({
      name: key,
      value: value,
      fill: colors[index % colors.length],
    }));
  }

  return (
    <Card elevated={true}>
      <h2 className="text-2xl font-bold">Languages</h2>
      {data ? (
        <ResponsiveContainer width={400} height={250}>
          <PieChart>
            <Pie
              data={transformedData}
              stroke="none"
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={4}
              cornerRadius={2}
            ></Pie>
            <Tooltip
              isAnimationActive={false}
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                return (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
                    <span>{payload[0].name}: </span>
                    {payload[0].value}%
                  </div>
                );
              }}
            ></Tooltip>
            <Legend iconType="circle" position="right"></Legend>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </Card>
  );
}
