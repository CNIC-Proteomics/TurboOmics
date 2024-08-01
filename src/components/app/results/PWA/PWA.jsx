import { Box } from '@mui/material'
import React, { useState } from 'react'
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
    const {  } = useVars();

    return (
        <Box>
            <Box sx={{ pt: 3 }}><ViewSelector view={view} setView={setView} /></Box>
            <ParamSelector />
        </Box>
    )
}


export default PWA