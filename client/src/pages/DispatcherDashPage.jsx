import React from "react";
import { Outlet, useLocation, Link} from "react-router-dom";
import DispatcherSidebar from "../components/DispatcherSidebar";

const DispatcherDashPage = () => {
  const { pathname } = useLocation();
 
  return (
    <div>
      <div className="flex justify-between items-center">
        <DispatcherSidebar />
      </div>
      {pathname !== "/dispatcher-dashboard" ? (
        <Outlet />
      ) : (
        <div className="m-5 flex flex-row">
          <div className='p-2 m-2 bg-white rounded-xl'>
                <div className='mr-6 ml-1 pb-2'>
                <h2 className="font-bold mb-2">Add New Job</h2>
                <Link to={'/dispatcher-dashboard/create-job'} className="btn-link px-4 py-1">Add</Link>
                </div>
              </div>

              <div className='p-2 m-2 bg-white rounded-xl'>
                <div className='mr-6 ml-1 pb-2'>
                  <h2 className="font-bold mb-2">View Job List</h2>
                <Link to={'/dispatcher-dashboard/job-lists'} className="btn-link px-4 py-1 ">View</Link>
                </div>
              </div>
        </div>
      )}
    </div>
  );
};

export default DispatcherDashPage;