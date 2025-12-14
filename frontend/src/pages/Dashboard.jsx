import { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axios";
import SweetCard from "../components/SweetCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);

  // Fetch sweets
  const fetchSweets = useCallback(async () => {
    try {
      const res = await api.get("/sweets");
      setSweets(res.data.sweets || res.data);
      setFilteredSweets(res.data.sweets || res.data);
    } catch {
      addToast("Failed to load sweets", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) fetchSweets();
  }, [user, fetchSweets]);

  // PURCHASE
  const handlePurchase = async (id, quantity) => {
    try {
      setPurchasing(id);
      const res = await api.post(`/sweets/${id}/purchase`, { quantity });

      setSweets(prev => prev.map(s => s._id === id ? res.data.sweet : s));
      setFilteredSweets(prev => prev.map(s => s._id === id ? res.data.sweet : s));

      addToast("Purchase successful 🍬", "success");
    } catch {
      addToast("Purchase failed", "error");
    } finally {
      setPurchasing(null);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sweet?")) return;

    try {
      await api.delete(`/sweets/${id}`);
      setSweets(prev => prev.filter(s => s._id !== id));
      setFilteredSweets(prev => prev.filter(s => s._id !== id));
      addToast("Sweet deleted", "success");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  // RESTOCK
  const handleRestock = async (sweet) => {
    const qty = prompt("Enter restock quantity:");
    if (!qty || qty <= 0) return;

    try {
      const res = await api.put(`/sweets/${sweet._id}/restock`, {
        quantity: Number(qty),
      });

      setSweets(prev => prev.map(s => s._id === sweet._id ? res.data.sweet : s));
      setFilteredSweets(prev => prev.map(s => s._id === sweet._id ? res.data.sweet : s));

      addToast("Sweet restocked 📦", "success");
    } catch {
      addToast("Restock failed", "error");
    }
  };

  // EDIT
  const handleEdit = async (sweet) => {
    const price = prompt("Enter new price:", sweet.price);
    if (!price) return;

    try {
      const res = await api.put(`/sweets/${sweet._id}`, {
        price: Number(price),
      });

      setSweets(prev => prev.map(s => s._id === sweet._id ? res.data.sweet : s));
      setFilteredSweets(prev => prev.map(s => s._id === sweet._id ? res.data.sweet : s));

      addToast("Sweet updated ✏", "success");
    } catch {
      addToast("Update failed", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🍬 Our Sweets</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSweets.map((sweet) => (
          <SweetCard
            key={sweet._id}
            sweet={sweet}
            onPurchase={handlePurchase}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestock={handleRestock}
            purchasing={purchasing === sweet._id}
          />
        ))}
      </div>
    </div>
  );
}
