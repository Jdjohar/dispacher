import React, {useState, useEffect} from 'react'
import { useAuth } from '../context/AuthContext';
import SafetyForm from '../components/SafetyForm';


const NewJob = () => {
  const [jobs, setJobs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const {user} = useAuth();
  const [options, setOptions] = useState([]);

  const handleAccept = async(jobId, jobStage) => {
    try {
      const response = await fetch('http://localhost:10000/api/updateStatus', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          jobStage
        }),
      });
      const data = await response.json();
      console.log(data);
      const updatedJobs = jobs.map((job) =>
        job._id === jobId ? { ...job, status: [...job.status, { type: jobStage, timestamp: new Date() }] } : job
      );
      console.log(updatedJobs);
      setJobs(updatedJobs);
      fetchJob(user.userMainId);
    } catch (error) {
      console.log(error);
    }
   }


  const fetchJob = async (userMainId) => {
    try {
      const response = await fetch(`http://localhost:10000/api/container-job?userMainId=${userMainId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const containerJob = await response.json();
      console.log(containerJob);
      setJobs(containerJob.jobs)
    } catch (error) {
      console.log(error);
    }
  }


  const handleSafetyFormClose = () => {
    // Update the last filled date in localStorage when the safety form is filled
    localStorage.setItem('lastFilledDate', new Date().toISOString().slice(0, 10));
    setIsOpen(false);
  };

  useEffect(()=>{
    fetchJob(user.userMainId);
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:10000/api/addressOptions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch options");
        }
        const data = await response.json();
        setOptions(data.addresses);
      } catch (error) {
        console.error("Error fetching uplift options:", error);
      }
    };

    fetchOptions();

    const lastFilledDate = localStorage.getItem('lastFilledDate');
    const todayDate = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

    if (!lastFilledDate || lastFilledDate !== todayDate) {
      setIsOpen(true); // Show the safety form if it hasn't been filled today
    }
  }, [])



  return (
    <div className='p-5 m-2'>
     <SafetyForm isOpen={isOpen} handleSafetyFormClose={handleSafetyFormClose} options={options}/>
        {jobs.length !== 0 ? jobs.map((job)=>(
                <div key={job._id} style={{position: 'relative'}} className='bg-white p-2 font-semibold rounded-md mt-14'>
                    {job.status.length !== 0 ? (
                       <div
                       style={{ position: "absolute" }}
                       className="top-[-46px] left-0 bg-blue-600 text-white my-2 px-2 rounded-t-md font-semibold"
                     >
                      
                      <div className='p-2'>
                        Status: <span className='capitalize'>{job.status[job.status.length-1].type}</span>
                      </div>
                      </div>) : (
                        <div style={{ position: "absolute" }}
                        className="top-[-46px] left-0 bg-blue-600 text-white my-2 px-2 rounded-t-md font-semibold">
                            <div className='p-2'>
                        Status: Pending
                      </div>
                        </div>
                      )}
                  <div className='grid sm:grid-cols-2 grid-cols-1 px-2 mt-4'>
                    <div>
                    <div>
                  Start Date - <span className='font-normal'>{job.jobStart}</span> 
                  </div>
                  <div>
                  PIN - <span className='font-normal'>{job.pin}</span> 
                  </div>
                  <div>
                  Commodity Code - <span className='font-normal'>{job.commodityCode}</span> 
                  </div>
                  <div>
                  Doors - <span className='font-normal'>{job.doors}</span> 
                  </div>
                  <div>
                  Slot - <span className='font-normal'>{job.slot}</span> 
                  </div>
                  <div>
                  DG - <span className='font-normal'>{job.dg}</span> 
                  </div>
                  <div>
                  Container No. - <span className='font-normal'>{job.containerNumber}</span> 
                  </div>
                    </div>

                    <div>
                    <div>
                  Uplift Address - <span className='font-normal'>{job.uplift}</span> 
                  </div>
                  <div>
                  Offload Address - <span className='font-normal'>{job.offload}</span> 
                  </div>
                  <div>
                  Size - <span className='font-normal'>{job.size}ft.</span> 
                  </div>
                  <div>
                  Release - <span className='font-normal'>{job.release}</span> 
                  </div>
                  <div>
                  Random - <span className='font-normal'>{job.random}</span> 
                  </div>
                  <div>
                  Weight - <span className='font-normal'>{job.weight} kg</span> 
                  </div>
                    </div>

                  </div>
                 <div className='px-2 mt-1'>
                 <span className="font-bold">Special Instructions:</span>
                  <br/>
                  <span className='text-lg font-normal'>{job.instructions}</span>
                 </div>
                 <div className='px-2 mt-2 font-semibold rounded-md text-black'>
                  <div className='flex justify-center items-center'>
                  {job.status.map((e, index)=>(
                    <div key={e._id}><span className='capitalize'>{e.type}</span> - {new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'short', // Use 'short' to get the month in abbreviated form (e.g., Jan, Feb)
                      day: '2-digit',
                      timeZone: 'IST' // Adjust this according to your requirements
                    }).format(new Date(e.timestamp)).replace(/(\w+)\s+(\d+),\s*(\d+)/, '$2-$1-$3')}
                    {index !== job.status.length - 1 && ' > '}
                    </div>
                  ))}
                  </div>
                 </div>

                 <div className='flex items-center justify-center my-5'>
                 <button
                  className={`stage-btn ${job.status.length === 0 ? 'bg-gradient-to-r from-[#69a875] to-[#2bdb03be]' : 'cursor-not-allowed opacity-50 pointer-events-none hidden'}`}
                  onClick={() => handleAccept(job._id, 'accept')}
                  disabled={job.status.includes('accept')}
                >
                  Accept Job
                </button>
                <button
                  className={`stage-btn ${job.status[job.status.length - 1]?.type === 'accept' ? 'bg-gradient-to-r from-[#8779c4] to-[#5f3cffe4]' : 'cursor-not-allowed opacity-50 pointer-events-none hidden'}`}
                  onClick={() => handleAccept(job._id, 'uplift')}
                  disabled={job.status.includes('uplift')}
                >
                  Uplift Done
                </button>
                <button
                  className={`stage-btn ${job.status[job.status.length - 1]?.type === 'uplift' ? 'bg-gradient-to-r from-[#f293ff] to-[#0e1afebe]' : 'cursor-not-allowed opacity-50 pointer-events-none hidden'}`}
                  onClick={() => handleAccept(job._id, 'offload')}
                  disabled={job.status.includes('offload')}
                >
                  Offload Done
                </button>
                <button
                  className={`stage-btn ${job.status[job.status.length - 1]?.type === 'offload'? 'bg-gradient-to-r from-[#f87575] to-[#0751ff]' : 'cursor-not-allowed opacity-50 pointer-events-none hidden'}`}
                  onClick={() => handleAccept(job._id, 'done')}
                  disabled={job.status.includes('done')}
                >
                  Job Done
                </button>
                 </div>
                </div>
              )) : (
                <div className='items-center'>
                  No Job Available At This Time.
                </div>
              )}
    </div>
  )
}

export default NewJob