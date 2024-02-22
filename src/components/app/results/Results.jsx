import { useCallback, useEffect, useRef, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useJob } from '../JobContext';
import DataDistribution from './EDA/DataDistribution/DataDistribution';
import PCA from './EDA/PCA/PCA';
import { useDispatchResults, useResults } from '../ResultsContext';
import { CircularProgress, Grid } from '@mui/material';
import { useVars } from '@/components/VarsContext';
import MOFA from './MOFA/MOFA';

export default function Results() {

    const dispatchResults = useDispatchResults();

    const { API_URL } = useVars();

    const fetchRef = useRef();

    const savedStatus = useResults().status;
    const [status, setStatus] = useState(savedStatus);

    const savedValue = useResults().value; // TabValue
    const [value, setValue] = useState(savedValue);

    const section = Math.floor(value);

    const { jobID, omics } = useJob();

    const handleChange = (event, newValue) => {
        setValue(newValue);
        dispatchResults({ type: 'set-tab-value', value: newValue });
    };

    const fetchStatus = useCallback(async () => {
        const res = await fetch(`${API_URL}/get_status/${jobID}/${omics.join('')}`);
        const resJson = await res.json();

        // If there is any change set it
        if (
            Object.keys(status).some(e => status[e].status != resJson[e].status)
        ) {
            console.log(`Set status: ${resJson}`);
            setStatus(resJson);
            dispatchResults({ type: 'set-status', status: resJson });
        }

        // If there is no waiting status, clear interval
        if (
            Object.keys(resJson).map(e => resJson[e].status != 'waiting').every(e => e)
        ) {
            clearInterval(fetchRef.current);
        }
    }, [API_URL, jobID, fetchRef, dispatchResults, status]);

    // Initialize fetchStatus
    useEffect(() => {
        console.log(`useEffect: Check status`);
        if (
            Object.keys(savedStatus).some(e => savedStatus[e].status == 'waiting')
        ) {
            console.log(`useEffect: Initialize status fetching`);
            fetchRef.current = setInterval(fetchStatus, 2500);
            return () => clearInterval(fetchRef.current);
        }

    }, [fetchRef, fetchStatus, savedStatus]);

    return (
        <>
            <Typography variant='body2' sx={{ textAlign: 'right', pr: 4 }}>Job ID: {jobID}</Typography>
            <Box
                sx={{ display: 'flex', flexGrow: 1, bgcolor: 'background.paper' }}
            >
                <Box sx={{width:'15%', borderRight: 1, borderColor: 'divider'}}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="Results Sections Tabs"
                        sx={{ width: '15%', position: 'fixed' }}
                    >
                        <Tab
                            label={<TabComponent text='EXPLORATORY DATA ANALYSIS' status='' />}
                            value={0.1}
                            sx={{ mt: 2, p: 0, color: section == 0 ? '#1976d2' : '#00000099' }}
                        />

                        <Tab
                            label={<TabComponent text='DATA DISTRIBUTION' status='' />}
                            value={0.1}
                            sx={{ fontSize: 12, m: 0, p: 0, borderTop: '1px solid #cccccc' }}
                        />

                        <Tab
                            label={<TabComponent text='PCA' status={status.EDA_PCA.status} />}
                            value={0.2}
                            sx={{ fontSize: 12, m: 0, p: 0, borderBottom: '1px solid #cccccc' }}
                            disabled={status.EDA_PCA.status != 'ok'}
                        />

                        <Tab
                            label={<TabComponent text='MULTIOMICS FACTOR ANALYSIS' status={status.MOFA.status} />}
                            value={1.1}
                            sx={{ fontSize: 12, mt: 2, p: 0 }}
                            disabled={status.MOFA.status != 'ok'}
                        />

                        <Tab
                            label={<TabComponent text='COMMUNITY ANALYSIS' status='' />}
                            value={2.1}
                            sx={{ fontSize: 12, mt: 2, p: 0 }}
                            disabled={true}
                        />

                        <Tab
                            label={<TabComponent text='REGULARIZED CANONICAL CORRELATION ANALYSIS' status='' />}
                            value={3.1}
                            sx={{ fontSize: 12, mt: 2, p: 0 }}
                            disabled={true}
                        />

                        <Tab
                            label={<TabComponent text='DIFFERENTIAL CORRELATION ANALYSIS' status='' />}
                            value={4.1}
                            sx={{ fontSize: 12, mt: 2, p: 0 }}
                            disabled={true}
                        />

                        <Tab
                            label={<TabComponent text='ELASTIC NET' status='' />}
                            value={5.1}
                            sx={{ fontSize: 12, mt: 2, p: 0 }}
                            disabled={true}
                        />

                    </Tabs>
                </Box>

                <Box sx={{ width: '85%', borderTop: '1px solid #cccccc' }}>
                    {value == 0.1 && <Box sx={{ p: 1 }}><DataDistribution /></Box>}
                    {value == 0.2 && <Box sx={{ p: 1 }}><PCA /></Box>}
                    {value == 1.1 && <Box sx={{ p: 1 }}><MOFA /></Box>}
                    {value == 2.1 && <Box sx={{ p: 1 }}>Community Analysis</Box>}
                    {value == 3.1 && <Box sx={{ p: 1 }}>rCCA</Box>}
                    {value == 4.1 && <Box sx={{ p: 1 }}>Differential Correlation Analysis</Box>}
                    {value == 5.1 && <Box sx={{ p: 1 }}>Elastic Net</Box>}
                </Box>
            </Box>
        </>
    );
}

const TabComponent = ({ text, status }) => {
    return (
        <Grid container sx={{ m: 'auto', height: 55 }}>
            {status == 'waiting' &&
                <Box sx={{ position: 'absolute', height: '100%' }}>
                    <Box sx={{ height: 20, position: 'relative', top: '35%', left: 7 }}>
                        <CircularProgress
                            sx={{ verticalAlign: 'middle' }}
                            size={15}
                            thickness={5} />
                    </Box>
                </Box>
            }
            <Typography sx={{ m: 'auto', width: "85%", fontSize: 13, position: 'relative', right: -12 }}>
                {text}
            </Typography>
        </Grid>
    )
}