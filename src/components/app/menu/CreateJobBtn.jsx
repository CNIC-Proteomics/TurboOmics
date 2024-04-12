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


export default function CreateJobBtn({ setCreatingJob, setPage, setAnnotating }) {

    const dispatchJob = useDispatchJob();
    const dispatchResults = useDispatchResults();
    const job = useJob();
    const { DEV_MODE, API_URL } = useVars();

    const handleCreateJob = async () => {

        // Reset (if necessary) annotations of CMM
        setAnnotating(false);

        // Set loading state
        setCreatingJob('waiting');

        // Get and set jobID
        const jobID = DEV_MODE ? '123456' : generateIdentifier(10);

        console.log(`Creating job: ${jobID}`);
        dispatchJob({
            type: 'set-job-id',
            jobID: jobID
        });

        // Generate boolean array with size of f2i indicating 
        // features that will be contained in xi_norm
        const f2x = {}
        job.omics.map(omic => {
            const xi = job.user[`x${omic}`];
            const f2i = job.user[`${omic}2i`];
            const mvthr = job.results.PRE.MVThr[`x${omic}`]
            const xfSerie = xi.isNa().sum({ axis: 0 }).div(xi.shape[0]).le(mvthr);
            f2x[omic] = f2i.index.map(f => {
                if (!xfSerie.index.includes(f)) return false;
                else return xfSerie.values[xfSerie.index.indexOf(f)];
            });
        });

        dispatchJob({
            type: 'set-f2x',
            f2x
        });

        // Create job in back-end
        const res = await fetch(`${API_URL}/create_job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...danfo2Json(job), f2x, jobID })
        });

        // Set jobContext received by back-end
        const resJson = await res.json();

        const newJob = json2Danfo(resJson);
        dispatchJob({
            type: 'set-job-context',
            jobContext: newJob
        });

        dispatchResults({type:'reset-results'});

        // Finish loading state
        if (job.omics.includes('m')) {
            setCreatingJob('ask-annotations');
        } else {
            setCreatingJob('');
            setPage('results');
        }
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
