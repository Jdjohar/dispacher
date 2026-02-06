import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

/* ===== Helper Components ===== */

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
      {value}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-500 uppercase">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
      active
        ? "bg-white text-indigo-600 shadow-sm"
        : "text-slate-500 hover:text-slate-700"
    }`}
  >
    {children}
  </button>
);

const UserCard = ({ user, onDelete, onEdit }) => (
  <div className="group bg-slate-50 p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all border hover:border-indigo-100 relative">
    {/* ACTION BUTTONS */}
    <div className="absolute top-3 right-3 flex gap-2">
      <button
        onClick={() => onEdit(user)}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold"
        title="Edit user"
      >
        ✎
      </button>
      <button
        onClick={() => onDelete(user._id)}
        className="text-rose-600 hover:text-rose-800 text-sm font-bold"
        title="Delete user"
      >
        ✕
      </button>
    </div>

    <div className="flex justify-between my-4">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
        {user.username?.charAt(0).toUpperCase()}
      </div>
      <span className="px-3 py-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full">
        {user.userType}
      </span>
    </div>

    <h4 className="font-bold text-slate-800 text-lg">{user.username}</h4>
    <p className="text-sm text-slate-500">{user.email}</p>

    {user.userMainId && (
      <p className="mt-2 text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-lg inline-block border">
        ID: {user.userMainId}
      </p>
    )}
  </div>
);

const EmptyState = () => (
  <div className="col-span-full py-16 text-center text-slate-400">
    No users found in this category.
  </div>
);

/* ===== Main Component ===== */

const AdminDashPage = () => {
  const { pathname } = useLocation();

  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState("container");
  const [isLoading, setIsLoading] = useState(true);

  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Fetch failed");
      setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setForm({
      username: user.username,
      email: user.email,
      userType: user.userType,
      userMainId: user.userMainId || "",
      isActive: user.isActive,
    });
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/${editUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u))
      );
      setEditUser(null);
    } catch (err) {
      alert("Update failed");
    }
  };

  if (pathname !== "/admin-dashboard") {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    );
  }

  const containerUsers = users.filter((u) => u.userType === "container");
  const dispatcherUsers = users.filter((u) => u.userType === "dispatcher");

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 space-y-10 bg-slate-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={users.length} />
          <StatCard title="Drivers" value={containerUsers.length} />
          <StatCard title="Dispatchers" value={dispatcherUsers.length} />
        </div>

        <div className="bg-white rounded-3xl border shadow-sm">
          <div className="p-6 border-b flex justify-between">
            <h2 className="text-xl font-bold">User Management</h2>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <TabButton active={selectedTab === "container"} onClick={() => setSelectedTab("container")}>
                Drivers
              </TabButton>
              <TabButton active={selectedTab === "dispatcher"} onClick={() => setSelectedTab("dispatcher")}>
                Dispatchers
              </TabButton>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedTab === "container" ? containerUsers : dispatcherUsers).map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onDelete={handleDeleteUser}
                    onEdit={openEditModal}
                  />
                ))}
                {(selectedTab === "container" ? containerUsers : dispatcherUsers).length === 0 && <EmptyState />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Edit User</h3>

            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Username"
            />

            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Email"
            />

            <select
              value={form.userType}
              onChange={(e) => setForm({ ...form, userType: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
            >
              <option value="container">Driver</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="admin">Admin</option>
            </select>

            <input
              value={form.userMainId}
              onChange={(e) => setForm({ ...form, userMainId: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="User Main ID"
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditUser(null)}
                className="px-6 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashPage;
