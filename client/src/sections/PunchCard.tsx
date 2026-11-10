import { ClipLoader } from "react-spinners";
import { useFetch } from "../hooks/useFetch";
import type { Details } from "../types/repository";
import { Card } from "../components/Card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import { MenuOption } from "../components/MenuOption";
import { ArrowDropDown } from "@mui/icons-material";

interface PunchCardItem {
  day: number;
  hour: number;
  commits: number;
}

const days = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export function PunchCard({ username, repository }: Details) {
  const [day, setDay] = useState(0);
  const url = `http://127.0.0.1:8000/${username}/${repository}/punch-card`;
  const data = useFetch<PunchCardItem[]>(url, true);
  let filteredData;

  if (data) {
    filteredData = data.filter((data) => data.day === day);
  }

  return (
    <Card elevated={true}>
      <div className="flex items-center">
        <h2 className="text-2xl font-bold mr-auto">Punch Card</h2>
        <Listbox value={day} onChange={setDay}>
          <ListboxButton className=" border-gray-700 border-2 rounded-lg p-2 hover:border-blue-600 space-x-4">
            <span>{days[day]}</span>
            <ArrowDropDown className="w-5 h-5"></ArrowDropDown>
          </ListboxButton>
          <ListboxOptions
            anchor={{ to: "bottom", gap: 12 }}
            className="text-white bg-gray-800 p-2 rounded-lg border border-gray-700"
          >
            <MenuOption value={0} text="Sunday"></MenuOption>
            <MenuOption value={1} text="Monday"></MenuOption>
            <MenuOption value={2} text="Tuesday"></MenuOption>
            <MenuOption value={3} text="Wednesday"></MenuOption>
            <MenuOption value={4} text="Thursday"></MenuOption>
            <MenuOption value={5} text="Friday"></MenuOption>
            <MenuOption value={6} text="Saturday"></MenuOption>
          </ListboxOptions>
        </Listbox>
      </div>
      {filteredData ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={filteredData}
            margin={{ bottom: 20, left: 20, top: 20, right: 20 }}
          >
            <XAxis
              dataKey="hour"
              label={{ value: "Hours", position: "bottom", fill: "#94a3b8" }}
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
            <Bar
              radius={2}
              dataKey="commits"
              stroke="#3340d4"
              fill="#4c58e6"
            ></Bar>
            <Tooltip
              cursor={{ fill: "#030712" }}
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
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ClipLoader></ClipLoader>
      )}
    </Card>
  );
}
