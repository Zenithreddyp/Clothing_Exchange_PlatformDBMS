import React, { useEffect, useState } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard.jsx";
import ItemModal from "../components/ItemModal.jsx"; // 👈 we'll create this next

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ exchanges: 0, donations: 0 });
  const [selectedItem, setSelectedItem] = useState(null); // 👈 track clicked item

  useEffect(() => {
    (async () => {
      try {
        console.log(localStorage.auth_user);
        const storedUser = JSON.parse(localStorage.getItem("auth_user"));
        const userId = storedUser?.user_id;
        const { data } = await api.get(
          `/clothes?status=exchange,Available&exclude_user=${userId}&limit=6`
        );
        setFeatured(data?.items || data || []);
      } catch (_) {}
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Stats */}
      <section className="rounded-2xl p-6 login-gradient">
        <h1 className="font-display text-3xl">Sustainable Clothing Exchange</h1>
        <p className="text-white/80 mt-2">
          Exchange or donate your clothes and earn eco-points.
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-black/40 rounded-lg p-4 text-center">
            <p className="text-white/60 text-sm">Total Exchanges</p>
            <p className="text-2xl font-semibold">{stats.exchanges}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 text-center">
            <p className="text-white/60 text-sm">Total Donations</p>
            <p className="text-2xl font-semibold">{stats.donations}</p>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Items</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featured.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              onClick={() => setSelectedItem(it)}
            />
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          showActions={false}
          onClose={() => setSelectedItem(null)}
          onOpenProduct={(item) => {
          
          window.location.href = `/product/${item.item_id || item.id}`;
        }}
        />
      )}
    </div>
  );
}
