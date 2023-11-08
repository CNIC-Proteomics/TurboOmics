import { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useJob } from '../JobContext';
import DataDistribution from './EDA/DataDistribution/DataDistribution';
import PCA from './EDA/PCA/PCA';
import { useDispatchResults, useResults } from '../ResultsContext';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function Results() {

    const { tabValue } = useResults()
    const dispatchResults = useDispatchResults();

    const [value, setValue] = useState(tabValue);
    const section = Math.floor(value);

    const { jobID } = useJob();

    const handleChange = (event, newValue) => {
        setValue(newValue);
        dispatchResults({type: 'set-tab-value', value: newValue});
    };

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
                        {...a11yProps(0)}
                        sx={{ mt: 2, p: 0, color: section == 0 ? '#1976d2' : '#00000099' }}
                    />
                    {(true || section == 0) && <Tab label="DATA DISTRIBUTION" value={0.1} {...a11yProps(1)} sx={{ fontSize: 12, m: 0, p: 0, borderTop: '1px solid #cccccc' }} />}
                    {(true || section == 0) && <Tab label="PCA" value={0.2} {...a11yProps(2)} sx={{ fontSize: 12, m: 0, p: 0, borderBottom: '1px solid #cccccc' }} />}

                    <Tab label="MULTIOMICS FACTOR ANALYSIS" value={1.1} {...a11yProps(1)} sx={{ mt: 2 }} />
                    <Tab label="COMMUNITY ANALYSIS" value={2.1} {...a11yProps(3)} sx={{ mt: 2 }} />
                    <Tab label="REGULARIZED CANONICAL CORRELATION ANALYSIS" value={3.1} {...a11yProps(4)} sx={{ mt: 2 }} />
                    <Tab label="DIFFERENTIAL CORRELATION ANALYSIS" value={4.1} {...a11yProps(5)} sx={{ mt: 2 }} />
                    <Tab label="ELASTIC NET" value={5.1} {...a11yProps(6)} sx={{ mt: 2 }} />
                </Tabs>

                <Box sx={{ width: '85%', borderTop: '1px solid #cccccc' }}>
                    {value == 0.1 && <Box sx={{ p: 1 }}><DataDistribution /></Box>}
                    {value == 0.2 && <Box sx={{ p: 1 }}><PCA /></Box>}
                    <TabPanel value={value} index={1.1}>
                        MOFA
                    </TabPanel>
                    <TabPanel value={value} index={2.1}>
                        Community Analysis
                    </TabPanel>
                    <TabPanel value={value} index={3.1}>
                        rCCA
                    </TabPanel>
                    <TabPanel value={value} index={4.1}>
                        Differential Correlation Analysis
                    </TabPanel>
                    <TabPanel value={value} index={5.1}>
                        Elastic Net
                    </TabPanel>
                </Box>
            </Box>
        </>
    );
}
