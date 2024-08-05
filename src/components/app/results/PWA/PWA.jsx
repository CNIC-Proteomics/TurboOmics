import { Box, Divider, LinearProgress, Typography } from '@mui/material'
import React, { useCallback, useRef, useState } from 'react'
import ViewSelector from './ViewSelector';
import { useJob } from '../../JobContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '../../../VarsContext';
import SendIcon from '@mui/icons-material/Send';
import ParamSelector from './ParamSelector';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Results from './Results';


// Main
function PWA() {

    const [view, setView] = useState('Single-View'); // Single-View, Multi-View

    // Get general variables
    const { API_URL } = useVars();

    // Get job variables
    const { omics, jobID, OS } = useJob();

    // From Reactome identifiers to info
    const [rId2info, setRId2info] = useState(
        omics.reduce((prev, curr) => ({ ...prev, [curr]: {} }), {})
    );

    // Job status and results
    const [jobStatus, setJobStatus] = useState({ status: '', res: null });

    // Send job to back-end
    const fetchJobRun = useCallback(async (mdataCol, mdataCategorical, omicIdR) => {
        console.log('Send job to back-end');
        console.log(mdataCol, mdataCategorical, omicIdR);

        const res = await fetch(
            `${API_URL}/run_pathway_analysis/${jobID}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    col: mdataCol.id,
                    type: mdataCategorical.isCategorical ? 'categorical' : 'numeric',
                    val1: mdataCategorical.g1.id,
                    val2: mdataCategorical.g2.id,
                    f2id: omicIdR,
                    view: view,
                    OS: OS.scientific_name.replace(' ', '_')
                })
            }
        );

        const resJson = await res.json();
        console.log(resJson);

        // Start asking for results
        setJobStatus({ status: 'waiting', res: null });
        getResIntervalRef.current = setInterval(() => fetchResults(resJson.runId), 5000);

    }, [view]);

    // Ask results to back-end
    const getResIntervalRef = useRef();

    const fetchResults = useCallback(async (runId) => {
        const res = await fetch(`${API_URL}/get_pathway_analysis/${jobID}/${view}/${runId}`);
        const resJson = await res.json();

        if (resJson.status != 'waiting') {
            console.log('Pathway analysis finished: ', resJson);
            setJobStatus(resJson);
            clearInterval(getResIntervalRef.current)
        }

    }, [getResIntervalRef]);

    return (
        <Box>
            <Box sx={{ pt: 3 }}><ViewSelector view={view} setView={setView} /></Box>
            <ParamSelector
                setRId2info={setRId2info}
                fetchJobRun={fetchJobRun}
            />
            <Divider sx={{ py: 4, color: 'black' }}> </Divider>
            {jobStatus.status == 'waiting' &&
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '50%', pt: 10 }}>
                        <LinearProgress sx={{ height: '2px' }} />
                    </Box>
                </Box>
            }
            {jobStatus.status == 'ok' &&
                <Results pwa_res={jobStatus.pwa_res} rId2info={rId2info} />
            }
            {jobStatus.status == 'error' &&
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center', pt:10 }}>
                        <ReportProblemIcon sx={{ fontSize: 25 }} />
                        <Typography variant='h6' sx={{px:2}}>
                            An error occurred when executing Pathway Analysis.
                        </Typography>
                    </Box>
                </Box>
            }
        </Box>
    )
}


export default PWA