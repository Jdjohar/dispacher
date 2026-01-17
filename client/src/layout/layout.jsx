import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuConfig = {
  admin: [
    { path: "/admin-dashboard", label: "Dashboard" },
    { path: "/admin-dashboard/users", label: "Add Users" },
    { path: "/admin-dashboard/address", label: "Add Address" },
    { path: "/admin-dashboard/add-job", label: "Add Job" },
    { path: "/admin-dashboard/listed-job", label: "Job List" },
    { path: "/admin-dashboard/report-section", label: "Reports" },
  ],
  dispatcher: [
    { path: "/dispatcher-dashboard", label: "Dashboard" },
    { path: "/dispatcher-dashboard/create-job", label: "Create Job" },
    { path: "/dispatcher-dashboard/job-lists", label: "Job List" },
    { path: "/dispatcher-dashboard/completed-job", label: "Completed Jobs" },
    { path: "/dispatcher-dashboard/report-section", label: "Reports" },
  ],
  container: [
    { path: "/container-dashboard", label: "Dashboard" },
    { path: "/container-dashboard/new-job", label: "New Jobs" },
    { path: "/container-dashboard/finished-job", label: "History" },
  ],
};

const Layout = ({ children, role }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const items = menuConfig[role];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white border-r
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="font-bold text-xl mb-6 uppercase">{role}</h2>

          <nav className="flex-1 space-y-2">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)} // 🔥 CLOSE ON NAV
                className={`block px-4 py-2 rounded-lg ${
                  location.pathname === item.path
                    ? "bg-indigo-100 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 py-2 rounded-lg bg-rose-600 text-white font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center px-4 lg:px-6">
          <button
            className="lg:hidden mr-4"
            onClick={() => setOpen((prev) => !prev)} // 🔥 TOGGLE
          >
            ☰
          </button>
          <h1 className="font-bold text-slate-800">
            {items.find(i => location.pathname === i.path)?.label || "Dashboard"}
          </h1>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
