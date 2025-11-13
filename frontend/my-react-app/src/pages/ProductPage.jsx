import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ExchangeModal from "../components/ExchangeModal"; // 👈 import the modal
import { toast } from "react-hot-toast";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false); // 👈 modal state

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/cloth/${id}`);
        const item = data.item;
        if (mounted) {
          setProduct({
            id: item.item_id,
            title: item.title,
            price: item.cost,
            size: item.size,
            condition: item.item_condition,
            cost: item.cost,
            description: item.description,
            image_url: item.image_url,
            category: item.category,
            brand: item.brand,
            seller: {
              id: item.seller_user_id,
              name: item.seller_name || `User ${item.seller_user_id}`,
              eco_points: item.seller_eco_points || 0,
            },
          });
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  // ✅ handle exchange selection - create exchange request
  const handleExchangeSelect = async (selectedItem) => {
    try {
      setShowExchangeModal(false);
      
      // Create exchange request via API
      const response = await api.post("/exchange", {
        requested_item_id: product.id,
        offered_item_id: selectedItem.item_id || selectedItem.id,
      });

      if (response.data) {
        toast.success("Exchange request created successfully!");
        // Optionally navigate to exchange requests page
        // navigate("/exchange-requests");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to create exchange request";
      toast.error(errorMessage);
      console.error("Exchange request error:", err);
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center text-white/70 bg-black/60 backdrop-blur-lg">
        Loading product...
      </div>
    );

  if (!product)
    return (
      <div className="fixed inset-0 flex items-center justify-center text-white/70 bg-black/60 backdrop-blur-lg">
        Product not found.
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen bg-black/60 backdrop-blur-xl text-white flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/10 border border-white/20 rounded-2xl max-w-3xl w-full p-6 relative backdrop-blur-2xl shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-1/2">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="rounded-xl w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                  No image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:w-1/2">
              <h1 className="text-3xl font-semibold mb-2">{product.title}</h1>
              <p className="text-xl text-yellow-400 font-semibold mb-4">
                {product.price ? `${product.price} Coins` : "Free"}
              </p>

              <div className="flex flex-wrap gap-2 text-sm text-white/70 mb-4">
                {product.size && (
                  <span className="bg-white/10 px-2 py-1 rounded">
                    Size: {product.size}
                  </span>
                )}
                {product.condition && (
                  <span className="bg-white/10 px-2 py-1 rounded">
                    {product.condition}
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setShowExchangeModal(true)} // 👈 open modal
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Exchange
                </button>
                <button
                  onClick={() => alert("Buy clicked")}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
                >
                  Buy with {product.cost || 0} Coins
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Create or get conversation with seller
                      const { data } = await api.post(`/conversations/${product.seller.id}`);
                      // Navigate to messages page with the conversation
                      navigate(`/messages?conversation=${data.conversation_id}`);
                    } catch (err) {
                      const errorMessage = err.response?.data?.error || err.message || "Failed to start conversation";
                      toast.error(errorMessage);
                    }
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Message Seller
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-1">Description</h3>
                <p className="text-white/70 text-sm whitespace-pre-wrap">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Seller Info */}
              <div
                onClick={() => navigate(`/user/${product.seller.id}`)}
                className="mt-6 bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition"
              >
                <div>
                  <h4 className="text-md font-semibold mb-1">Seller</h4>
                  <p className="text-white/80 text-sm">
                    {product.seller?.name || "Unknown"}
                  </p>
                  <p className="text-white/60 text-xs">
                    Eco Points: {product.seller?.eco_points}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-400">
                  Error loading data: {error}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ✅ Exchange Modal */}
        {showExchangeModal && (
          <ExchangeModal
            onClose={() => setShowExchangeModal(false)}
            onSelectItem={handleExchangeSelect}
            targetItem={{
              title: product.title,
              seller_name: product.seller?.name,
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
