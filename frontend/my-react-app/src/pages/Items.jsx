import React, { useEffect, useState } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard.jsx";
import { toast } from "react-hot-toast";
import { CATEGORIES, ITEM_STATUSES } from "../constants/enums";
import ItemModal from "../components/ItemModal.jsx";


export default function Items() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [q, setQ] = useState({
    search: "",
    size: "",
    brand: "",
    category: "",
    item_status: "",
  });

  const load = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("auth_user"));
      const userId = storedUser?.user_id;
      const params = new URLSearchParams();
      if (q.search) params.set("search", q.search);
      if (q.size) params.set("size", q.size);
      if (q.brand) params.set("brand", q.brand);
      if (q.category) params.set("category", q.category);
      if (q.item_status && q.item_status !== "All")
        params.set("item_status", q.item_status);

      const { data } = await api.get(`/clothes?${params.toString()}&exclude_user=${userId}&limit=10`);

      const allItems = data?.items || data || [];
      const filtered = allItems;
      
      setItems(filtered);
    } catch (err) {
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    load();
  }, [q.item_status]);

  const onDelete = async (item) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/cloth/${item.item_id || item.id}`);
      toast.success("Item deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
        {/* 🔍 Search Bar */}
        <input
          className="bg-black/40 border border-white/10 rounded px-3 py-2"
          placeholder="Search title or description"
          value={q.search}
          onChange={(e) => setQ({ ...q, search: e.target.value })}
        />
        <input
          className="bg-black/40 border border-white/10 rounded px-3 py-2"
          placeholder="Size"
          value={q.size}
          onChange={(e) => setQ({ ...q, size: e.target.value })}
        />
        <input
          className="bg-black/40 border border-white/10 rounded px-3 py-2"
          placeholder="Brand"
          value={q.brand}
          onChange={(e) => setQ({ ...q, brand: e.target.value })}
        />
        <select
          className="bg-black/40 border border-white/10 rounded px-3 py-2"
          value={q.category}
          onChange={(e) => setQ({ ...q, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          className="bg-black/40 border border-white/10 rounded px-3 py-2"
          value={q.item_status}
          onChange={(e) => setQ({ ...q, item_status: e.target.value })}
        >
          {ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded bg-brand-500 hover:bg-brand-600 border border-white/60 hover:bg-white/10"
          >
            Search
          </button>
          <a
            href="/add-item"
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20"
          >
            Add Item
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it) => (
        <ItemCard
          key={it.item_id || it.id}
          item={it}
          onClick={() => setSelectedItem(it)}
        />
      ))}
    </div>

    {selectedItem && (
      <ItemModal
        item={selectedItem}
        showActions={false} // 🔴 hide buttons in preview modal
        onClose={() => setSelectedItem(null)}
        onOpenProduct={(item) => {
          // 🟢 open product page when modal is clicked
          window.location.href = `/product/${item.item_id || item.id}`;
        }}
        // onExchange={() => console.log("Exchange requested")}
        // onBuy={() => console.log("Buy with coins")}
      />
    )}

    </div>
  );
}
