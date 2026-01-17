import React, { useEffect, useState } from "react";

const AdminAddress = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";
  const token = localStorage.getItem("token");

  const [addresses, setAddresses] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  /* =========================
     FETCH ADDRESSES
  ========================= */
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Fetch failed");
      setAddresses(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* =========================
     ADD / UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const url = editingId
        ? `${API_BASE}/api/addresses/${editingId}`
        : `${API_BASE}/api/addresses`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, address }),
      });

      if (!res.ok) throw new Error("Save failed");

      setFeedback({
        type: "success",
        msg: editingId ? "Address updated" : "Address added",
      });

      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", msg: "Operation failed" });
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address permanently?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  /* =========================
     EDIT INIT
  ========================= */
  const startEdit = (addr) => {
    setEditingId(addr._id);
    setName(addr.name);
    setEmail(addr.email);
    setAddress(addr.address);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setAddress("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-10">
      {/* ================= FORM ================= */}
      <div className="bg-white rounded-3xl border shadow-sm">
        <div className="p-8 border-b bg-slate-50">
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit Location" : "Add Logistics Hub"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Location Name"
            className="w-full px-4 py-3 rounded-xl border"
          />

          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Contact Email"
            className="w-full px-4 py-3 rounded-xl border"
          />

          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full Address"
            className="w-full px-4 py-3 rounded-xl border"
          />

          {feedback && (
            <div
              className={`p-3 rounded-xl text-sm font-semibold ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {feedback.msg}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              {isLoading
                ? "Saving..."
                : editingId
                ? "Update Address"
                : "Add Address"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border rounded-xl font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ================= LIST ================= */}
      <div className="bg-white rounded-3xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Saved Locations</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.length === 0 && (
            <p className="col-span-full text-center text-slate-400">
              No locations added yet
            </p>
          )}

          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="p-6 rounded-2xl border bg-slate-50 hover:bg-white transition"
            >
              <h4 className="font-bold">{addr.name}</h4>
              <p className="text-sm text-slate-600">{addr.address}</p>
              <p className="text-xs text-slate-400 mt-2">{addr.email}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => startEdit(addr)}
                  className="text-sm font-bold text-indigo-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-sm font-bold text-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAddress;
