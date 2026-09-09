"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardCharts({
  visitors,
  logins,
  orders,
  methods,
}: {
  visitors: { name: string; count: number }[];
  logins: { name: string; count: number }[];
  orders: { name: string; count: number }[];
  methods: { name: string; count: number }[];
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Chart title="Daily visitors" data={visitors} />
      <Chart title="Daily logins" data={logins} />
      <Chart title="Orders created" data={orders} />
      <Chart title="Mobile OTP vs Email OTP" data={methods} />
    </div>
  );
}

function Chart({ title, data }: { title: string; data: { name: string; count: number }[] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#1e4d8c"
              strokeWidth={2.4}
              dot={{ r: 3, fill: "#c4a35a" }}
              isAnimationActive
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
