"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Deck } from "@/lib/deckApi";

const chartData = [
  { date: "Jul 1", decks: 3 },
  { date: "Jul 7", decks: 5 },
  { date: "Jul 14", decks: 8 },
  { date: "Jul 21", decks: 13 },
  { date: "Jul 28", decks: 20 },
];

export function Chart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDecks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f8cfb" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4f8cfb" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="decks" stroke="#4f8cfb" fill="url(#colorDecks)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
