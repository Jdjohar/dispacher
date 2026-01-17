import React, {useState} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import close from '../assets/close.svg';
import open from '../assets/open.svg';
import image1 from '../assets/image 1.png';

const DispatcherSidebar = () => {
    const {logout} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
     setSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        logout()
        navigate('/')
    }
  return (
    <div>
    {/* <button onClick={toggleSidebar} className='bg-black p-1 left-0 rounded-r-lg'>
    <img src={open} alt="open" className='bg-black rounded-md w-[35px] h-[35px]' />
    </button> */}
    
    <div style={{position: 'fixed', top: '0', left: '0', zIndex: '100'}} className={`bg-white transition-transform duration-300 min-h-full ${isSidebarOpen ? 'translate-x-[0]' : 'translate-x-[-100%]'} min-w-[200px]`}>
    <div>
      <button
        onClick={toggleSidebar}
        className="text-white ml-40 mt-5 focus:outline-none focus:bg-gray-700"
      >
        <div>
          <img src={close} alt="close" className='bg-white rounded-md w-[35px] h-[35px]'/>
        </div>
      </button>
    </div>
    <div className={`my-2 mx-2 px-5 gap-2`}>
        <div>
          <img src={image1} alt="logo" />
        </div>
        <h1 className='font-bold mt-2 mb-3'>DISPATCHER</h1>
        <hr/>
      <Link
        to="/dispatcher-dashboard"
        className={`block m-1 mb-3 mt-3 rounded-md hover:font-bold ${
          location.pathname === '/dispatcher-dashboard' ? 'font-bold' : 'text-gray-800'
        }`}
      >
        Dashboard
      </Link>
      <Link
        to="/dispatcher-dashboard/create-job"
        className={`block m-1 mb-3 mt-3 rounded-md hover:font-bold ${
          location.pathname === '/dispatcher-dashboard/create-job' ? 'font-bold' : 'text-gray-800'
        }`}
      >
       Add Job
      </Link>
      <Link
        to="/dispatcher-dashboard/job-lists"
        className={`block m-1 mb-3 mt-3 rounded-md hover:font-bold ${
          location.pathname === '/dispatcher-dashboard/job-lists' ? 'font-bold' : 'text-gray-800'
        }`}
      >
      Job List
      </Link>
      <Link
        to="/dispatcher-dashboard/report-section"
        className={`block m-1 mb-3 mt-3 rounded-md hover:font-bold ${
          location.pathname === '/dispatcher-dashboard/report-section' ? 'font-bold' : 'text-gray-800'
        }`}
      >
      Report Section
      </Link>
      <Link
        to="/dispatcher-dashboard/completed-job"
        className={`block m-1 mb-3 mt-3 rounded-md hover:font-bold ${
          location.pathname === '/dispatcher-dashboard/completed-job' ? 'font-bold' : 'text-gray-800'
        }`}
      >
       Completed Jobs
      </Link>
      <button className='btn mt-5' onClick={handleLogout}>Logout</button>
    </div>
  </div>
  </div>
  )
}

export default DispatcherSidebar