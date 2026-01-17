import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout from "./layout/layout";

// Pages
import HomePage from "./pages/HomePage";

// Admin
import AdminDashPage from "./pages/AdminDashPage";
import AdminUser from "./pages/AdminUser";
import AdminAddress from "./pages/AdminAddress";
import CreateJob from "./pages/CreateJob";
import ExcelJob from "./pages/ExcelJob";
import ReportSection from "./pages/ReportSection";

// Dispatcher
import DispatcherDashPage from "./pages/DispatcherDashPage";
import CompletedJob from "./pages/CompletedJob";

// Container
import ContainerDashPage from "./pages/ContainerDashPage";
import NewJob from "./pages/NewJob";
import ContainerJob from "./pages/ContainerJob";

/* 🔐 Role Guard */
const PrivateRoute = ({ role }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn()) return <Navigate to="/" replace />;
  if (user?.userType !== role) return <Navigate to="/" replace />;

  return <Outlet />;
};

function App() {
  const { setUser } = useAuth();

  useEffect(() => {
    const userDataString = localStorage.getItem("userInfo");
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, [setUser]);

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<HomePage />} />

      {/* ADMIN */}
      <Route element={<PrivateRoute role="admin" />}>
        <Route
          path="/admin-dashboard/*"
          element={
            <Layout role="admin">
              <Outlet />
            </Layout>
          }
        >
          <Route index element={<AdminDashPage />} />
          <Route path="users" element={<AdminUser />} />
          <Route path="address" element={<AdminAddress />} />
          <Route path="add-job" element={<CreateJob />} />
          <Route path="listed-job" element={<ExcelJob />} />
          <Route path="report-section" element={<ReportSection />} />
        </Route>
      </Route>

      {/* DISPATCHER */}
      <Route element={<PrivateRoute role="dispatcher" />}>
        <Route
          path="/dispatcher-dashboard/*"
          element={
            <Layout role="dispatcher">
              <Outlet />
            </Layout>
          }
        >
          <Route index element={<DispatcherDashPage />} />
          <Route path="create-job" element={<CreateJob />} />
          <Route path="job-lists" element={<ExcelJob />} />
          <Route path="completed-job" element={<CompletedJob />} />
          <Route path="report-section" element={<ReportSection />} />
        </Route>
      </Route>

      {/* CONTAINER */}
      <Route element={<PrivateRoute role="container" />}>
        <Route
          path="/container-dashboard/*"
          element={
            <Layout role="container">
              <Outlet />
            </Layout>
          }
        >
          <Route index element={<ContainerDashPage />} />
          <Route path="new-job" element={<NewJob />} />
          <Route path="finished-job" element={<ContainerJob />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
