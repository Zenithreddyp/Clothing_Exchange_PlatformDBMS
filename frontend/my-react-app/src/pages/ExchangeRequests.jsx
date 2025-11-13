import React, { useEffect, useState } from "react";
import api from "../services/api";
import ExchangeCard from "../components/ExchangeCard.jsx";
import { toast } from "react-hot-toast";

export default function ExchangeRequests() {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/exchange");
      const allReqs = data?.requests || data || [];
      // Remove the incorrect filter - backend returns proper exchange requests
      setRequests(allReqs);
    } catch (err) {
      console.error("Error loading exchange requests:", err);
      toast.error("Failed to load exchange requests");
      setRequests([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAccept = async (req) => {
    await api.post(`/exchange/${req.id}/accept`);
    toast.success("Accepted");
    load();
  };
  const onReject = async (req) => {
    await api.post(`/exchange/${req.id}/reject`);
    toast("Rejected");
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Exchange Requests</h1>
      <div className="grid grid-cols-1 gap-3">
        {requests.map((r) => (
          <ExchangeCard
            key={r.id}
            request={r}
            onAccept={onAccept}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
