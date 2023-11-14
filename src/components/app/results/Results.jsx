import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useJob } from '../JobContext';
import DataDistribution from './EDA/DataDistribution/DataDistribution';
import PCA from './EDA/PCA/PCA';
import { useDispatchResults, useResults } from '../ResultsContext';
import { CircularProgress } from '@mui/material';
import { useVars } from '@/components/VarsContext';

const statusTemplate = {
    'EDA_PCA': 'waiting', // waiting, ok, error
    'MOFA': 'waiting',
    //'LEIDEN': 'waiting',
    //'rCCA': 'waiting',
    //'DCA': 'waiting',
    //'ENET': 'waiting'
}

export default function Results() {

    const { tabValue } = useResults()
    const dispatchResults = useDispatchResults();

    const { API_URL } = useVars();

    const fetchRef = useRef();
    const [status, setStatus] = useState(statusTemplate);

    const [value, setValue] = useState(tabValue);
    const section = Math.floor(value);

    const { jobID } = useJob();

    const handleChange = (event, newValue) => {
        setValue(newValue);
        dispatchResults({ type: 'set-tab-value', value: newValue });
    };

    const fetchStatus = async () => {
        const res = await fetch(`${API_URL}/get_status/${jobID}`);
        const resJson = await res.json();
        
        setStatus(resJson);
        
        if(
            Object.keys(resJson).map(e => resJson[e] != 'waiting').every(e => e)
        ) {
            clearInterval(fetchRef.current);
        }
    }

    return (
        <>
            <Typography variant='body2' sx={{ textAlign: 'right', pr: 4 }}>Job ID: {jobID}</Typography>
            <Box
                sx={{ display: 'flex', flexGrow: 1, bgcolor: 'background.paper', height: "80vh" }}
            >
                <Tabs
                    orientation="vertical"
                    //variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Results Sections Tabs"
                    sx={{ borderRight: 1, borderColor: 'divider', width: '15%' }}
                >
                    <Tab
                        label="EXPLORATORY DATA ANALYSIS"
                        value={0.1}
                        sx={{ mt: 2, p: 0, color: section == 0 ? '#1976d2' : '#00000099' }}
                    />
                    {(true || section == 0) && <Tab label="DATA DISTRIBUTION" value={0.1} sx={{ fontSize: 12, m: 0, p: 0, borderTop: '1px solid #cccccc' }} />}
                    {(true || section == 0) && <Tab label="PCA" value={0.2} sx={{ fontSize: 12, m: 0, p: 0, borderBottom: '1px solid #cccccc' }} />}

                    <Tab label={<Typography><CircularProgress size={12} thickness={2} /> MULTIOMICS FACTOR ANALYIS</Typography>} value={1.1} sx={{ mt: 2 }} disabled={true} />
                    <Tab label="COMMUNITY ANALYSIS" value={2.1} sx={{ mt: 2 }} disabled />
                    <Tab label="REGULARIZED CANONICAL CORRELATION ANALYSIS" value={3.1} sx={{ mt: 2 }} disabled />
                    <Tab label="DIFFERENTIAL CORRELATION ANALYSIS" value={4.1} sx={{ mt: 2 }} disabled />
                    <Tab label="ELASTIC NET" value={5.1} sx={{ mt: 2 }} disabled />
                </Tabs>

                <Box sx={{ width: '85%', borderTop: '1px solid #cccccc' }}>
                    {value == 0.1 && <Box sx={{ p: 1 }}><DataDistribution /></Box>}
                    {value == 0.2 && <Box sx={{ p: 1 }}><PCA /></Box>}
                    {value == 1.1 && <Box sx={{ p: 1 }}>MOFA</Box>}
                    {value == 2.1 && <Box sx={{ p: 1 }}>Community Analysis</Box>}
                    {value == 3.1 && <Box sx={{ p: 1 }}>rCCA</Box>}
                    {value == 4.1 && <Box sx={{ p: 1 }}>Differential Correlation Analysis</Box>}
                    {value == 5.1 && <Box sx={{ p: 1 }}>Elastic Net</Box>}
                </Box>
            </Box>
        </>
    );
}
