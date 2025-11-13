import React from "react";
import { motion } from "framer-motion";
import { CATEGORIES, ITEM_CONDITIONS, ITEM_STATUSES } from "../constants/enums";

export default function ItemCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onRequestExchange,
}) {
  // Validate and get valid ENUM values
  const category = CATEGORIES.includes(item.category) ? item.category : "";
  const condition = ITEM_CONDITIONS.includes(item.item_condition)
    ? item.item_condition
    : "";
  const status = ITEM_STATUSES.includes(item.item_status)
    ? item.item_status
    : "Available";

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500/80";
      case "Exchange":
        return "bg-blue-500/80";
      case "Donated":
        return "bg-gray-500/80";
      default:
        return "bg-white/10";
    }
  };

  return (
    <motion.div
      onClick={() => onClick?.(item)}
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-brand-500 transition"
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          {status && (
            <span
              className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}
            >
              {status}
            </span>
          )}
        </div>
        <p className="text-white/70 text-sm">{item.description}</p>
        <div className="flex flex-col gap-1 text-sm text-white/70">
          {/* First row — category, condition, brand, size */}
          <div className="flex flex-wrap gap-2">
            {category && (
              <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300">
                {category}
              </span>
            )}
            {condition && (
              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300">
                {condition}
              </span>
            )}
            {item.brand && (
              <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80">
                {item.brand}
              </span>
            )}
            {item.size && (
              <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80">
                Size {item.size}
              </span>
            )}
          </div>

          {/* Second row — Eco points */}
          {item.cost && (
            <span className="block mt-2 px-3 py-1 rounded-lg bg-green-500/20 text-green-300 font-semibold w-fit">
              🌱 Eco Points: {item.cost}
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {onRequestExchange && status === "Available" && (
            <button
              onClick={() => onRequestExchange(item)}
              className="px-3 py-1 rounded bg-brand-500 hover:bg-brand-600"
            >
              Exchange
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
