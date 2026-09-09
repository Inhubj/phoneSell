"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AnalyticsCharts({
  brands,
  models,
  execs,
  areas,
}: {
  brands: { name: string; count: number }[];
  models: { name: string; count: number }[];
  execs: { name: string; count: number }[];
  areas: { name: string; count: number }[];
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Chart title="Most requested brands" data={brands} />
      <Chart title="Most requested models" data={models} />
      <Chart title="Top pickup executives" data={execs} />
      <Chart title="Area-wise demand" data={areas} />
    </div>
  );
}

function Chart({ title, data }: { title: string; data: { name: string; count: number }[] }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1e4d8c" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
