import { Backdrop, Box, CircularProgress, Divider, LinearProgress, Typography } from '@mui/material'
import React, { useCallback, useRef, useState } from 'react'
import ViewSelector from './ViewSelector';
import { useJob } from '../../JobContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '../../../VarsContext';
import SendIcon from '@mui/icons-material/Send';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import dynamic from 'next/dynamic'

const ParamSelector = dynamic(
    () => import('./ParamSelector')
);
//import ParamSelector from './ParamSelector';

const Results = dynamic(
    () => import('./Results')
);
//import Results from './Results';

// Main
function PWA() {

    // Get results variables
    const dispatchResults = useDispatchResults();
    const savedResultsPWA = useResults().PWA;

    // Local states
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(savedResultsPWA.view); // Single-View, Multi-View

    // Get general variables
    const { API_URL } = useVars();

    // Get job variables
    const { omics, jobID, OS } = useJob();


    // From Reactome identifiers to info
    const [rId2info, setRId2info] = useState(
        savedResultsPWA.rId2info ? savedResultsPWA.rId2info :
        omics.reduce((prev, curr) => ({ ...prev, [curr]: {} }), {})
    );

    // Job status and results
    const getResIntervalRef = useRef();
    const [jobStatus, setJobStatus] = useState(savedResultsPWA.jobStatus)

    // Which omics are being used in the analysis
    const [workingOmics, setWorkingOmics] = useState(savedResultsPWA.workingOmics);

    // Capture mdataCategorical (it comes from ParamSelector)
    const [mdataCategorical, setMdataCategorical] = useState(savedResultsPWA.mdataCategoricalRes);

    // Get job results from back-end
    const fetchResults = useCallback(async (runId) => {
        console.log('Fetching Pathway Analysis results');
        const res = await fetch(`${API_URL}/get_pathway_analysis/${jobID}/${view}/${runId}`);
        const resJson = await res.json();

        if (resJson.status != 'waiting') {
            console.log('Pathway Analysis finished: ', resJson);
            dispatchResults({type: 'set-pwa-attr', attr:'jobStatus', value:resJson});
            setJobStatus(resJson);
            clearInterval(getResIntervalRef.current)
        }

    }, [getResIntervalRef, view, API_URL, jobID, dispatchResults]);

    // Send job to back-end
    const fetchJobRun = useCallback(async (mdataCol, mdataCategorical, omicIdR, runId) => {
        console.log('Send job to back-end');
        //const runId = (new Date()).getTime();
        console.log(`runId: ${runId}`);

        const res = await fetch(
            `${API_URL}/run_pathway_analysis/${jobID}/${runId}`,
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
        setJobStatus({ status: 'waiting', pwa_res: null, runId: resJson.runId });
        clearInterval(getResIntervalRef.current); // clear what was saved
        getResIntervalRef.current = setInterval(() => fetchResults(resJson.runId), 5000);

        // Set working omics
        const _workingOmics = Object.keys(omicIdR).filter(e => omicIdR[e]);
        setWorkingOmics(_workingOmics);
        dispatchResults({ type: 'set-pwa-attr', attr: 'workingOmics', value: _workingOmics });

        const _mdataCategorical = { ...mdataCategorical, mdataCol: mdataCol.id }
        dispatchResults({ type: 'set-pwa-attr', attr: 'mdataCategoricalRes', value: _mdataCategorical });
        setMdataCategorical(_mdataCategorical);

        dispatchResults({type: 'set-pwa-attr', attr: 'rId2info', value: rId2info});


    }, [view, setWorkingOmics, setJobStatus, setMdataCategorical, 
        API_URL, OS, fetchResults, jobID, rId2info, dispatchResults]);

    return (
        <Box>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress color="inherit" />
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        Loading modules for Pathway Analysis...
                    </Box>
                </Box>
            </Backdrop>
            <Box sx={{ pt: 3 }}>
                <ViewSelector
                    view={view}
                    setView={setView}
                    resetJobStatus={() => setJobStatus(prev => ({ ...prev, status: '' }))}
                />
            </Box>
            <ParamSelector
                setRId2info={setRId2info}
                fetchJobRun={fetchJobRun}
                setLoading={setLoading}
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
                <Results
                    pwa_res={jobStatus.pwa_res}
                    runId={jobStatus.runId}
                    rId2info={rId2info}
                    view={view}
                    workingOmics={workingOmics}
                    mdataCategorical={mdataCategorical}
                />
            }
            {jobStatus.status == 'error' &&
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 10 }}>
                        <ReportProblemIcon sx={{ fontSize: 25 }} />
                        <Typography variant='h6' sx={{ px: 2 }}>
                            An error occurred when executing Pathway Analysis.
                        </Typography>
                    </Box>
                </Box>
            }
        </Box>
    )
}


export default PWA