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
  const data = useFetch<Data>(url);

  let transformedData;

  if (data) {
    transformedData = Object.entries(data).map(([key, value]) => ({
      name: key,
      value: value,
    }));
  }

  return (
    <Card elevated={true}>
      {data ? (
        <ResponsiveContainer width={400} height={400}>
          <PieChart>
            <Pie
              data={transformedData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={4}
              cornerRadius={2}
            ></Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                return (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
                    <span>{payload[0].name}: </span>
                    {payload[0].value}
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
