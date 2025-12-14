// FILE: src/components/SweetModal.jsx
import { useState, useEffect } from "react";

export default function SweetModal({ isOpen, onClose, onSubmit, sweet, mode }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: "chocolate", label: "🍫 Chocolate" },
    { value: "candy", label: "🍬 Candy" },
    { value: "cake", label: "🎂 Cake" },
    { value: "cookie", label: "🍪 Cookie" },
    { value: "ice_cream", label: "🍦 Ice Cream" },
    { value: "traditional", label: "🪔 Traditional" },
    { value: "pastry", label: "🥐 Pastry" },
  ];

  useEffect(() => {
    if (sweet && mode === "edit") {
      setForm({
        name: sweet.name || "",
        category: sweet.category || "",
        price: sweet.price?.toString() || "",
        quantity: sweet.quantity?.toString() || "",
        description: sweet.description || "",
      });
    } else {
      setForm({
        name: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
      });
    }
    setErrors({});
  }, [sweet, mode, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!form.quantity || Number(form.quantity) < 0)
      newErrors.quantity = "Valid quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === "edit" ? "✏ Edit Sweet" : "➕ Add New Sweet"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sweet Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`input-field ${
                errors.name ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter sweet name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`input-field ${
                errors.category ? "border-red-500 focus:border-red-500" : ""
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`input-field ${
                  errors.price ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={`input-field ${
                  errors.quantity ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="0"
                min="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input-field resize-none h-24"
              placeholder="Enter a description (optional)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {mode === "edit" ? "Update Sweet" : "Add Sweet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}