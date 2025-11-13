import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TRANSACTION_TYPES } from "../constants/enums";
import { useMemo } from "react";

export default function EcoPoints() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/eco_points");
        // Filter and validate transaction types
        const validTransactions = (data.transactions || []).map((t) => ({
          ...t,
          type: TRANSACTION_TYPES.includes(t.type) ? t.type : "Earn",
        }));
        setTransactions(validTransactions);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to load eco points:", err);
      }
    })();
  }, []);

  const chartData = transactions.map((t) => ({
    name: new Date(t.date).toLocaleDateString(),
    points: t.points,
  }));

  const getTypeColor = (type) => {
    return type === "Earn" ? "text-green-400" : "text-red-400";
  };

  const groupedData = useMemo(() => {
    // Simple grouping placeholder — backend or util functions can refine this
    const grouped = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key;
      if (viewMode === "weekly")
        key = `Week ${Math.ceil(date.getDate() / 7)} - ${date.toLocaleString(
          "default",
          { month: "short" }
        )}`;
      else if (viewMode === "monthly")
        key = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      else key = date.toLocaleDateString();

      grouped[key] = (grouped[key] || 0) + t.points;
    });
    return Object.keys(grouped).map((k) => ({ name: k, points: grouped[k] }));
  }, [transactions, viewMode]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Eco-points</h1>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-white/80">
          Total: <span className="font-semibold">{total}</span>
        </p>
        <div className="flex gap-2 mb-4">
          {["daily", "weekly", "monthly"].map((v) => (
            <button
              key={v}
              className={`px-3 py-1 rounded ${
                viewMode === v ? "bg-brand-500" : "bg-white/10"
              }`}
              onClick={() => setViewMode(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="points" fill="#d27a18" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Points</th>
              <th className="text-left p-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-white/10">
                <td className="p-3">{new Date(t.date).toLocaleString()}</td>
                <td className={`p-3 ${getTypeColor(t.type)}`}>
                  {TRANSACTION_TYPES.includes(t.type) ? t.type : "Earn"}
                </td>
                <td className="p-3">{t.points}</td>
                <td className="p-3">{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
