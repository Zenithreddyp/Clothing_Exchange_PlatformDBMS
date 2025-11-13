import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, ecoPoints, refreshEcoPoints } = useAuth();
  const [completed, setCompleted] = useState([]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const { data } = await api.get("/exchange?status=completed");
  //       setCompleted(data?.exchanges || []);
  //     } catch (err) {
  //       console.error("Failed to load completed exchanges:", err);
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    refreshEcoPoints();
  }, [refreshEcoPoints]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-3xl font-semibold mb-2">Profile</h1>

      {/* User Info + Add Button + Eco Points */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-white/80">
            <span className="text-white/60">Name:</span>{" "}
            <span className="font-semibold">
              {user?.name || user?.username || "-"}
            </span>
          </p>
          <p className="text-white/80">
            <span className="text-white/60">Email:</span>{" "}
            <span className="font-semibold">{user?.email || "-"}</span>
          </p>
          <p className="text-white/80">
            <span className="text-white/60">Eco Points:</span>{" "}
            <span className="font-semibold text-green-400">{ecoPoints}</span>
          </p>
        </div>

        {/* Add Item button */}
        <a
          href="/add-item"
          className="self-start sm:self-auto px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-white font-medium"
        >
          ➕ Add New Item
        </a>
      </div>

      {/* Completed exchanges */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Completed Exchanges</h2>
        {completed.length ? (
          <ul className="space-y-2">
            {completed.map((ex) => (
              <li key={ex.id} className="border-b border-white/10 pb-2 text-white/80">
                <span className="font-medium text-white">{ex.item_title}</span>{" "}
                with <span className="text-brand-400">{ex.partner_name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white/60">No completed exchanges yet.</p>
        )}
      </div>
    </div>
  );
}
