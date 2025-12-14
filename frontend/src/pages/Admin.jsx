import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import SweetModal from "../components/SweetModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { ToastContext } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";

export default function Admin() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);

  // Fetch sweets
  useEffect(() => {
    if (user) fetchSweets();
  }, [user]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sweets");
      setSweets(res.data.sweets || res.data);
    } catch {
      addToast("Failed to load sweets", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add sweet
  const handleAddSweet = async (data) => {
    try {
      setActionLoading(true);
      const res = await api.post("/sweets", data);
      setSweets((prev) => [res.data.sweet, ...prev]);
      setModalOpen(false);
      addToast("Sweet added successfully 🍬", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Add failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Update sweet
  const handleUpdateSweet = async (data) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/sweets/${editingSweet._id}`, data);
      setSweets((prev) =>
        prev.map((s) => (s._id === editingSweet._id ? res.data.sweet : s))
      );
      setEditingSweet(null);
      setModalOpen(false);
      addToast("Sweet updated ✏", "success");
    } catch {
      addToast("Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete sweet
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sweet?")) return;

    try {
      await api.delete(`/sweets/${id}`);
      setSweets((prev) => prev.filter((s) => s._id !== id));
      addToast("Sweet deleted 🗑", "success");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">⚙ Admin Panel</h1>
        <button
          onClick={() => {
            setEditingSweet(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          ➕ Add Sweet
        </button>
      </div>

      {/* Sweets Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-amber-500 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No sweets found 🍭
                </td>
              </tr>
            ) : (
              sweets.map((sweet) => (
                <tr key={sweet._id} className="border-t">
                  <td className="p-3">{sweet.name}</td>
                  <td className="p-3 capitalize">{sweet.category}</td>
                  <td className="p-3">₹{sweet.price}</td>
                  <td className="p-3">{sweet.quantity}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSweet(sweet);
                        setModalOpen(true);
                      }}
                      className="btn-secondary"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDelete(sweet._id)}
                      className="btn-danger"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <SweetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSweet(null);
        }}
        onSubmit={editingSweet ? handleUpdateSweet : handleAddSweet}
        sweet={editingSweet}
        mode={editingSweet ? "edit" : "add"}
        loading={actionLoading}
      />
    </div>
  );
}
