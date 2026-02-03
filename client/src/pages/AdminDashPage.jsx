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



const UserCard = ({ user, onDelete }) => (
  <div className="group bg-slate-50 p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all border hover:border-indigo-100 relative">
    {/* DELETE BUTTON */}
    <button
      onClick={() => onDelete(user._id)}
      className="absolute top-3 right-3 text-rose-600 hover:text-rose-800 font-bold text-sm"
      title="Delete user"
    >
      ✕
    </button>

    <div className="flex justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
        {user.username?.charAt(0).toUpperCase()}
      </div>
      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full">
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

  const API_BASE = import.meta.env.VITE_API_URL || "https://dispacher-nu.vercel.app";

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data); // ✅ backend returns array directly
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user? This cannot be undone."
    );
  
    if (!confirm) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("Delete failed");
  
      // remove from UI instantly
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Failed to delete user");
    }
  };
  
  useEffect(() => {
    fetchAllUsers();
  }, []);

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

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between">
            <h2 className="text-xl font-bold">User Management</h2>

            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <TabButton
                active={selectedTab === "container"}
                onClick={() => setSelectedTab("container")}
              >
                Drivers
              </TabButton>
              <TabButton
                active={selectedTab === "dispatcher"}
                onClick={() => setSelectedTab("dispatcher")}
              >
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
                {(selectedTab === "container"
                  ? containerUsers
                  : dispatcherUsers
                ).map((user) => (
                  <UserCard
  key={user._id}
  user={user}
  onDelete={handleDeleteUser}
/>
                ))}

                {(selectedTab === "container"
                  ? containerUsers
                  : dispatcherUsers
                ).length === 0 && <EmptyState />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashPage;
