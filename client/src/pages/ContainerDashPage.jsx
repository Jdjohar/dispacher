import React, { useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import ContainerSidebar from "../components/ContainerSidebar";

const ContainerDashPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  /* =========================
     AUTH + ROLE GUARD
  ========================= */
  useEffect(() => {
    if (!token || !userInfo) {
      navigate("/login", { replace: true });
      return;
    }

    if (userInfo.userType !== "container") {
      navigate("/unauthorized", { replace: true });
    }

    console.log(userInfo);
    
  }, [token, userInfo, navigate]);

  const isRootDashboard =
    location.pathname === "/container-dashboard" ||
    location.pathname === "/container-dashboard/";

  // Nested routes render only outlet + sidebar
  if (!isRootDashboard) {
    return (
      <div className="flex">
        {/* <ContainerSidebar /> */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* <ContainerSidebar /> */}

      <div className="flex-1 p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Card */}
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {userInfo?.username || "Driver 2"}!
              </h2>
              <p className="text-indigo-100 opacity-90">
                Manage your daily routes and completed jobs here.
              </p>
            </div>

            <div className="absolute right-0 bottom-0 opacity-10">
              <svg
                className="w-48 h-48"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              to="/container-dashboard/new-job"
              className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h3 className="font-bold text-slate-800 text-lg">
                Active Jobs
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                View and update your current assignments.
              </p>
            </Link>

            <Link
              to="/container-dashboard/finished-job"
              className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="font-bold text-slate-800 text-lg">
                Job History
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Review your previously completed jobs.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerDashPage;
