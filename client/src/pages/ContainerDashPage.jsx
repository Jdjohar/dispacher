import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import ContainerSidebar from '../components/ContainerSidebar';

const ContainerDashPage = () => {
  const {pathname} = useLocation();
  
  return (
    <div>
      <div className='flex justify-between items-center'>
      <ContainerSidebar/>
      </div>
          {pathname !== '/container-dashboard' ? <Outlet/> : (
            <div className='m-5 flex flex-row'>
              <div className='p-2 m-2 bg-white rounded-xl'>
                <div className='mr-6 ml-1 pb-2 pr-6'>
                <h2 className="font-bold mb-2">New Job</h2>
                <Link to={'/container-dashboard/new-job'} className="btn-link px-4 py-2">Add</Link>
                </div>
              </div>

              <div className='p-2 m-2 bg-white rounded-xl'>
                <div className='mr-6 ml-1 pb-2'>
                  <h2 className="font-bold mb-2">Completed Jobs</h2>
                <Link to={'/container-dashboard/finished-job'} className="btn-link px-4 py-2">View</Link>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}

export default ContainerDashPage