import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SweetCard({
  sweet,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  purchasing,
}) {
  const { isAdmin } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = sweet.quantity === 0;

  const getCategoryEmoji = (category) => {
    const emojis = {
      chocolate: "🍫",
      candy: "🍬",
      cake: "🎂",
      cookie: "🍪",
      ice_cream: "🍦",
      traditional: "🪔",
      pastry: "🥐",
      default: "🍭",
    };
    return emojis[category?.toLowerCase()] || emojis.default;
  };

  const getCategoryColor = (category) => {
    const colors = {
      chocolate: "from-amber-700 to-yellow-800",
      candy: "from-pink-500 to-rose-500",
      cake: "from-purple-500 to-pink-500",
      cookie: "from-amber-500 to-orange-500",
      ice_cream: "from-cyan-400 to-blue-500",
      traditional: "from-orange-500 to-red-500",
      pastry: "from-yellow-500 to-amber-500",
      default: "from-gray-400 to-gray-500",
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  const handlePurchase = () => {
    if (quantity > 0 && quantity <= sweet.quantity) {
      onPurchase(sweet._id, quantity);
    }
  };

  return (
    <div className="card hover:shadow-2xl transition-all duration-300">
      {/* Category */}
      <div className={`bg-gradient-to-r ${getCategoryColor(sweet.category)} p-4 text-white`}>
        <div className="flex justify-between items-center">
          <span className="text-3xl">{getCategoryEmoji(sweet.category)}</span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full capitalize">
            {sweet.category || "Sweet"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-1">{sweet.name}</h3>

        {sweet.description && (
          <p className="text-sm text-gray-500 mb-3">{sweet.description}</p>
        )}

        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold">₹{sweet.price}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              isOutOfStock
                ? "bg-red-100 text-red-600"
                : sweet.quantity < 10
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `${sweet.quantity} left`}
          </span>
        </div>

        {/* Quantity */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input
              type="number"
              className="w-12 text-center border"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(sweet.quantity, Math.max(1, Number(e.target.value)))
                )
              }
            />
            <button onClick={() => setQuantity(Math.min(sweet.quantity, quantity + 1))}>+</button>
            <span className="text-sm text-gray-500">
              Total: ₹{(sweet.price * quantity).toFixed(2)}
            </span>
          </div>
        )}

        {/* Purchase */}
        <button
          onClick={handlePurchase}
          disabled={isOutOfStock || purchasing}
          className="btn-primary w-full mb-2"
        >
          {purchasing ? "Processing..." : isOutOfStock ? "Out of Stock" : "Purchase"}
        </button>

        {/* ADMIN ACTIONS */}
        {isAdmin() && (
          <div className="flex gap-2 pt-2 border-t">
            <button onClick={() => onEdit(sweet)}>✏ Edit</button>
            <button onClick={() => onRestock(sweet)}>📦 Restock</button>
            <button onClick={() => onDelete(sweet._id)}>🗑 Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
