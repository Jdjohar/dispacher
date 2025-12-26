import React, {useEffect} from 'react';
import { Routes, Route, Navigate} from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminDashPage from './pages/AdminDashPage';
import DispatcherDashPage from './pages/DispatcherDashPage';
import ContainerDashPage from './pages/ContainerDashPage';
import { useAuth } from './context/AuthContext';
import AdminUser from './pages/AdminUser';
import AdminAddress from './pages/AdminAddress';
import CreateJob from './pages/CreateJob';
import CompletedJob from './pages/CompletedJob';
import ContainerJob from './pages/ContainerJob';
import NewJob from './pages/NewJob';
import ExcelJob from './pages/ExcelJob';
import ReportSection from './pages/ReportSection';

function App() {
  const { isLoggedIn, user, setUser} = useAuth();

  useEffect(() => {
    const userDataString = localStorage.getItem('userInfo');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUser(userData);
    }
  }, [setUser]);

  function PrivateRoute({ userType, element }) {
    if (!isLoggedIn()) {
      return <Navigate to="/" />;
    }
    if (isLoggedIn() && user?.userType !== userType) {
      return <Navigate to="/" />
    }
  
    return element
  }

  return (
   <Routes>
    <Route index path='/' element={<HomePage/>}/>
    <Route
      path="/admin-dashboard"
      element={<PrivateRoute element={<AdminDashPage />} userType="admin" />}
    >
      <Route path='users' element={<AdminUser />}/>
      <Route path='address' element={<AdminAddress/>}/>
      <Route path='add-job' element={<CreateJob/>}/>
      <Route path='listed-job' element={<ExcelJob/>}/>
      <Route path='report-section' element={<ReportSection/>}/>
    </Route>
    <Route
      path="/dispatcher-dashboard"
      element={<PrivateRoute element={<DispatcherDashPage />} userType="dispatcher" />}
    >
      <Route path='create-job' element={<CreateJob />}/>
      <Route path='job-lists' element={<ExcelJob />}/>
      <Route path='completed-job' element={<CompletedJob/>}/>
      <Route path='report-section' element={<ReportSection/>}/>
    </Route> 
    <Route
      path="/container-dashboard"
      element={<PrivateRoute element={<ContainerDashPage />} userType="container" />}
    >
      <Route path='new-job' element={<NewJob />}/>
      <Route path='finished-job' element={<ContainerJob />}/>
      </Route>
   </Routes>
  )
}

export default App;