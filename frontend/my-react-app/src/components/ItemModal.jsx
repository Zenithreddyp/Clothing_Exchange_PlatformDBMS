import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ItemModal({
  item,
  onClose,
  onExchange,
  onBuy,
  showActions = true,
  onOpenProduct,
}) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white/10 border border-white/20 rounded-xl max-w-md w-full p-6 text-white relative backdrop-blur-xl cursor-pointer"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenProduct) {
              // small delay for smooth animation
              setTimeout(() => onOpenProduct(item), 150);
            }
          }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>

          {/* Image */}
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          {/* Info */}
          <h2 className="text-2xl font-semibold">{item.title}</h2>
          <p className="text-white/70 text-sm mt-1">{item.description}</p>

          <div className="flex flex-wrap gap-2 mt-3 text-sm text-white/60">
            {item.category && (
              <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300">
                {item.category}
              </span>
            )}
            {item.item_condition && (
              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300">
                {item.item_condition}
              </span>
            )}
            {item.brand && <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80">{item.brand}</span>}
            {item.size && <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80">Size {item.size}</span>}
          </div>

          {/* Conditional Buttons */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExchange(item);
                }}
                className="flex-1 bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded"
              >
                Exchange
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuy(item);
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
              >
                Buy with Coins
              </button>

              {/* 🆕 See Details Button (for show-off)
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // just visual — optional: can open product
                  console.log("See Details clicked for", item);
                }}
                className="flex-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded"
              >
                See Details
              </button> */}
            </div>
          )}

          {!showActions && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 cursor-pointer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // just visual — optional: can open product
                  if (onOpenProduct) {
                    // small delay for smooth animation
                    setTimeout(() => onOpenProduct(item), 150);
                  }
                }}
                className="flex-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded cursor-pointer"
              >
                See Details
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
