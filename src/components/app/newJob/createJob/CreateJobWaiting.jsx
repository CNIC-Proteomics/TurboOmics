import { useVars } from '@/components/VarsContext';
import { Box } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useRef, useState } from 'react';
import { useJob } from '../../JobContext';

export default function CreateJobWaiting({ creatingJob }) {

    const [log, setLog] = useState([{}]);
    const logRef = useRef();
    const { API_URL } = useVars();
    const { jobID } = useJob();

    useEffect(() => {

        logRef.current = setInterval(async () => {
            const res = await fetch(`${API_URL}/get_create_job_log/${jobID}`);
            const resJson = await res.json();
            setLog(resJson);
        }, 2000);

        return () => clearInterval(logRef.current);

    }, [logRef, jobID, API_URL])

    return (
        <Box>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={creatingJob == 'waiting'}
            >
                <Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress color="inherit" />
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>This may take a while. Please be patient...</Box>
                    <Box sx={{ mt: 0, textAlign: 'center' }}>{log[log.length - 1].msg}</Box>
                </Box>
            </Backdrop>
        </Box>
    );
}