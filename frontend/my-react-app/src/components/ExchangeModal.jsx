import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function ExchangeModal({ onClose, onSelectItem, targetItem }) {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/users/user/my-items");
        if (mounted) setMyItems(data.items || []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const handleConfirm = () => {
    onSelectItem(selectedItem);
    setSelectedItem(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/10 border border-white/20 rounded-xl w-full max-w-lg p-6 text-white relative backdrop-blur-xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-4 border-b border-white/10 pb-2">
            Select an item to exchange
          </h2>

          {loading && <p className="text-white/60">Loading your items...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && (
            <div
              className="max-h-80 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
              style={{ overflowX: "hidden" }}
            >
              {myItems.length === 0 && (
                <p className="text-white/60">You have no items available.</p>
              )}

              {myItems.map((item) => (
                <motion.div
                  key={item.item_id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center gap-4 bg-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="w-16 h-16 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/50 text-xs">No image</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-yellow-400 font-medium">
                      {item.cost} Coins
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 👇 Confirmation Popup */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white/10 border border-white/20 rounded-xl w-full max-w-md p-6 text-white relative backdrop-blur-xl shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-center">
                  Confirm Exchange
                </h3>

                <div className="text-center space-y-2 mb-6">
                  <h5 className="text-white/80">You are going to exchange</h5>
                  <h5 className="text-lg">
                    <span className="font-bold ">{selectedItem.title}</span>{" "}
                    from <span className="text-white/70">your closet</span>
                  </h5>
                  <h5 className="text-white/60">with</h5>
                  <h5 className="text-lg">
                    <span className="font-bold text-yellow-400">
                      {targetItem?.title || "seller’s item"}
                    </span>{" "}
                    from{" "}
                    <span className="font-bold text-green-400">
                      {targetItem?.seller_name || "Seller"}
                    </span>
                    ’s closet
                  </h5>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      onClose();
                    }}
                    className="px-5 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                  >
                    No
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-5 py-2 bg-yellow-500/80 rounded-lg hover:bg-yellow-500 transition-all text-black font-semibold"
                  >
                    Yes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
