import { Box, Card, Typography, styled } from '@mui/material';
import React from 'react'
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { getStyle } from './getStyle';
import generateIdentifier from '@/utils/generateIdentifier';
import { json2Danfo, danfo2Json } from '@/utils/jobDanfoJsonConverter';
import { useDispatchJob, useJob } from '../JobContext';
import { useVars } from '@/components/VarsContext';
import { useDispatchResults } from '../ResultsContext';

const StyledCard = styled(Card)(({ theme }) => ({
    transition: "transform 0.15s ease-in-out, background 0.15s",
    "&:hover": { transform: "scale3d(1.05, 1.05, 1)", backgroundColor: 'rgba(255, 0, 0, 0.3)' },
}));


export default function CreateJobBtn({ setCreatingJob }) {

    const dispatchJob = useDispatchJob();
    const dispatchResults = useDispatchResults();
    const job = useJob();
    const { DEV_MODE, API_URL } = useVars();

    const handleCreateJob = async () => {

        // Set loading state
        setCreatingJob('waiting');

        // Get and set jobID
        const jobID = DEV_MODE ? '123456' : generateIdentifier(10);
        console.log(`Creating job: ${jobID}`);
        dispatchJob({
            type: 'set-job-id',
            jobID: jobID
        });

        // Create job in back-end
        console.log(danfo2Json(job))
        const res = await fetch(`${API_URL}/create_job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...danfo2Json(job), jobID: jobID })
        });

        // Set jobContext received by back-end
        const resJson = await res.json();

        console.log(resJson);

        const newJob = json2Danfo(resJson);
        dispatchJob({
            type: 'set-job-context',
            jobContext: newJob
        });

        dispatchResults({type:'reset-results'});

        // Finish loading state
        setCreatingJob('ask-annotations');

        console.log(newJob);
    }

    return (
        <StyledCard
            sx={{ ...getStyle('rgba(255, 0, 0, 0.2)'), position: 'absolute', right: '12%' }}
            onClick={handleCreateJob}
        >
            <Box sx={{ py: 1 }}>
                <NoteAddIcon />
            </Box>
            <Box>
                <Typography gutterBottom variant="h7" component="div">Create Job</Typography>
            </Box>
        </StyledCard>
    )
}
