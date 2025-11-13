import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UserProfile() {
  const navigate = useNavigate();

  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/users/user/${id}`);
        setUser(data.user);
        setEcoPoints(data.user.eco_points || 0);
        setItems(data.user.items || []);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        Loading user profile...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        User not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 text-white">
      <h1 className="text-3xl font-semibold mb-2">
        {user.name || `User ${id}`}
      </h1>

      {/* User Info Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between sm:justify-between gap-4">
        {/* mt-6 bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition */}
        <div className="space-y-1">
          <p className="text-white/80">
            <span className="text-white/60">Name:</span>{" "}
            <span className="font-semibold">{user.name || "-"}</span>
          </p>
          {/* <p className="text-white/80">
            <span className="text-white/60">Email:</span>{" "}
            <span className="font-semibold">{user.email || "-"}</span>
          </p>
          {user.phone && (
            <p className="text-white/80">
              <span className="text-white/60">Phone:</span>{" "}
              <span className="font-semibold">{user.phone}</span>
            </p>
          )} */}

          <p className="text-white/80">
            <span className="text-white/60">Eco Points:</span>{" "}
            <span className="font-semibold text-green-400">{ecoPoints}</span>
          </p>
        </div>
        <img
          src="/media/image.png"
          alt="Chat icon"
          className="w-5 h-5 filter invert cursor-pointer hover:opacity-80 transition"
          onClick={async () => {
            try {
              // Create or get conversation with the profile user
              const { data } = await api.post(`/conversations/${id}`);
              navigate(`/messages?conversation=${data.conversation_id}`);
            } catch (err) {
              const errorMessage =
                err.response?.data?.error ||
                err.message ||
                "Failed to start conversation";
              toast.error(errorMessage);
            }
          }}
        />
      </div>

      {/* Seller's Listed Items */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          {user.name?.split(" ")[0] || "Seller"}’s Listings
        </h2>

        {items.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.item_id}
                className="bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:bg-white/15 transition cursor-pointer"
                onClick={() =>
                  (window.location.href = `/product/${item.item_id}`)
                }
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-white/10 flex items-center justify-center text-white/60">
                    No image
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-white/70 truncate">
                    {item.description || "No description"}
                  </p>
                  <p className="text-yellow-400 font-semibold text-sm">
                    {item.cost} Coins
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60">No items listed yet.</p>
        )}
      </div>
    </div>
  );
}
