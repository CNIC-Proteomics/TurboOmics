import { Box } from '@mui/material'
import React, { useCallback, useState } from 'react'
import ViewSelector from './ViewSelector';
import { useJob } from '../../JobContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '../../../VarsContext';
import SendIcon from '@mui/icons-material/Send';
import ParamSelector from './ParamSelector';


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

    console.log(rId2info);

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

    }, [view]);

    return (
        <Box>
            <Box sx={{ pt: 3 }}><ViewSelector view={view} setView={setView} /></Box>
            <ParamSelector
                setRId2info={setRId2info}
                fetchJobRun={fetchJobRun}
            />
        </Box>
    )
}


export default PWA