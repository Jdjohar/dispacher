import React, {useState, useEffect, useRef} from 'react'
import { DownloadTableExcel } from 'react-export-table-to-excel';
import ReactPaginate from 'react-paginate';

const ExcelJob = () => {
  const [allJobs, setAllJobs] = useState([]);
  const tableRef = useRef(null);
  const [id, setId] = useState({});
  const [ids, setIds] = useState([]);
  const [updates, setUpdates] = useState([])
  const [pageNumber, setPageNumber] = useState(0);
  const [showAllJobs, setShowAllJobs] = useState(false); // State to toggle showing all jobs

  const toggleShowAllJobs = () => {
    setShowAllJobs(!showAllJobs);
    setPageNumber(0); // Reset page number when toggling
  };
  const jobsPerPage = 10;

  const getColorBasedOnDate = (jobStartDate, containerNum) => {
    const jobStart = new Date(jobStartDate);
    const today = new Date();
    const differenceInMilliseconds = jobStart.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInMilliseconds / (24 * 60 * 60 * 1000));
   
    // If today is one day away from jobStart, change color
    if (differenceInDays === 1 && !containerNum) {
      return {
        backgroundColor: '#DD0404', // Set your desired background color here
        textColor: 'white', // Set your desired text color here
      };
    }
  
    // Default colors
    return {
      backgroundColor: 'white',
      textColor: 'black',
    };
    
  };

  const calculateDaysDifference = (date1, date2) => {
    const differenceInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(differenceInMilliseconds / (24 * 60 * 60 * 1000));
  };

  const jobsWithDaysDifference = allJobs.map((job) => {
    const jobStart = new Date(job.jobStart);
    const today = new Date();
    const daysDifference = calculateDaysDifference(today, jobStart);
  
    return { ...job, daysDifference };
  });
  
  const sortedJobs = jobsWithDaysDifference.sort((a, b) => {
    if (!a.containerNum && b.containerNum) {
      return -1;
  }
  // If a job is assigned and b job is not assigned, b should come before a
  if (a.containerNum && !b.containerNum) {
      return 1;
  }
  // If both jobs are either assigned or not assigned, sort by daysDifference
  return a.daysDifference - b.daysDifference;
  })

  const getAllJobs = async () => {
    try {
      const response = await fetch("https://dispacher-nu.vercel.app/api/jobs/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data.jobs);
      setAllJobs(data.jobs)
    } catch (error) {
      console.log(error);
    }
  }

  const fetchIds = async() => {
    try {
      const response = await fetch("https://dispacher-nu.vercel.app/api/unassigned", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const containers = await response.json();
      setIds(containers)
    } catch (error) {
      console.log(error);
    }
  }

  const handleAssign = async (e, jobId) => {
    e.preventDefault();

    const selectedId = id[jobId];

    try {
      const response = await fetch('https://dispacher-nu.vercel.app/api/updateJob', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedId,
        jobId,
      }),
    });

    

    if (!response.ok ) {
      throw new Error('Failed to update job');
    }

    const updatedJob = await response.json();
    setUpdates(updatedJob)
    console.log('Job updated successfully:', updatedJob);

    } catch (error) {
      console.log(error);
    }
  };

  const pageCount = Math.ceil(
    (showAllJobs ? allJobs.length : sortedJobs.length) / jobsPerPage
  );
  const offset = pageNumber * jobsPerPage;
  const currentPageJobs = showAllJobs ? allJobs : sortedJobs.slice(offset, offset + jobsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  useEffect(()=>{
    getAllJobs()
    fetchIds()
  }, [])

  useEffect(() => {
    getAllJobs()
    fetchIds();
  }, [updates]);

  const rowStyle = {
    borderBottom: '1px solid #ccc', // You can adjust the border style as needed
  };

  return (
    <div>
      <button className='btn mt-3 ml-4' onClick={toggleShowAllJobs}>
        {showAllJobs ? 'Show Paginated Jobs' : 'Show All Jobs'}
      </button>
       <DownloadTableExcel
                    filename="jobs table"
                    sheet="jobs"
                    currentTableRef={tableRef.current}
                >
                   <button className='btn mt-3 ml-4'>Export Page Jobs</button>
       </DownloadTableExcel>
        <div className='m-5 bg-white rounded-xl '>
            <div className='overflow-x-auto p-2 pb-4'>
              <div className='table-container'>
            <table ref={tableRef} className='custom-table'>
                 <tbody>
                    <tr>
                        <th>Start Date</th>
                        <th>Pin:</th>
                        <th>Booking Slot:</th>
                        <th>Commmodity Code:</th>
                        <th>Size</th>
                        <th>DG</th>
                        <th>Uplift Address:</th>
                        <th>Offload Address:</th>
                        <th>Doors:</th>
                        <th>Random:</th>
                        <th>Release:</th>
                        <th>Weight</th>
                        <th>Special Instructions</th>
                        <th>Container Number</th>
                        <th>Assign User</th>
                    </tr>
                    {currentPageJobs.map((job)=>{
                      const { backgroundColor, textColor } = getColorBasedOnDate(job.jobStart, job.userMainId);
                      return(
                        <tr key={job._id} style={{...rowStyle, backgroundColor, color: textColor}}>
                        <td>{job.jobStart}</td>
                        <td>{job.pin}</td>
                        <td>{job.slot}</td>
                        <td>{job.commodityCode}</td>
                        <td>{job.size}</td>
                        <td>{job.dg}</td>
                        <td>{job.uplift}</td>
                        <td>{job.offload}</td>
                        <td>{job.doors}</td>
                        <td>{job.random}</td>
                        <td>{job.release}</td>
                        <td>{job.weight}</td>
                        <td>{job.instructions}</td>
                        <td>{job.containerNumber}</td>
                        {job.userMainId ? (
                          <td>{job.userMainId}</td>
                        ) : (
                          <td>
                            <form onSubmit={(e)=>handleAssign(e, job._id)} className="flex items-center min-w-full">
                            <select
                          value={id[job._id] || ""}
                          required
                          onChange={(e) => setId({ ...id, [job._id]: e.target.value })}
                          className="rounded-md p-2 bg-white text-black ring-1 ring-blue-500 ring-opacity-2 focus:outline-none my-3 ml-1 min-w-50"
                        >
                          <option value="" disabled>
                            Select User ID
                          </option>
                          {ids && ids.map((cont) => (
                            <option key={cont._id} value={cont.userMainId}>{cont.userMainId}</option>
                          ))}
                        </select>
                        <button type="submit" className="bg-black m-2.5 text-white py-1 px-4 rounded-md">Assign</button>
                            </form>
                          </td>
                        )}
                      </tr>
                     )})}
                  </tbody>
                </table>
                </div>
                <div className='pagination-container'>
                  {showAllJobs ? null : (
                    <ReactPaginate
                    previousLabel={'Prev.'}
                    nextLabel={'Next'}
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    containerClassName={'pagination'}
                    previousLinkClassName={'pagination__link'}
                    nextLinkClassName={'pagination__link'}
                    disabledClassName={'pagination__link--disabled'}
                    activeClassName={'pagination__link--active'}
                  />
                  )}    
               </div>
            </div>
        </div>
    </div>
  )
}

export default ExcelJob;