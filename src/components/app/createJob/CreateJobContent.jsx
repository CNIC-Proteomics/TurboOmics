import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SelectColumn from './SelectColumn';
import { useDispatchJob, useJob } from '../JobContext';
import MyTable from './MyTable';
import { Button } from '@mui/material';
import generateIdentifier from '@/utils/generateIdentifier';
import { useVars } from '@/components/VarsContext';
import { danfo2Json, json2Danfo } from '@/utils/jobDanfoJsonConverter';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function CreateJobContent({ setPage, loading, setLoading }) {

    const dispatchJob = useDispatchJob();
    const job = useJob();
    const mode = useJob().annotations.mode; // 0 --> user; 1 --> cmm-tp
    const annotationColumn = useJob().annotations.column;
    const m2i = useJob().user.m2i;
    const { API_URL, DEV_MODE } = useVars();


    const handleChange = (event, newValue) => {
        //setValue(newValue);
        dispatchJob({
            type: 'set-annotations-mode',
            mode: newValue
        })
    };

    const handleCreateJob0 = async () => {

        // Set loading state
        setLoading(true);

        // Get and set jobID
        const jobID = DEV_MODE ? '123456' : generateIdentifier(10);
        console.log(`Creating job: ${jobID}`);
        dispatchJob({
            type: 'set-job-id',
            jobID: jobID
        });

        // Create job in back-end
        const res = await fetch(`${API_URL}/create_job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...danfo2Json(job), jobID: jobID })
        });

        // Set jobContext received by back-end
        const resJson = await res.json()
        const newJob = json2Danfo(resJson);
        dispatchJob({
            type: 'set-job-context',
            jobContext: newJob
        });

        // Finish loading state
        setLoading(false);

        // Set results page
        setPage('results');
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={mode} onChange={handleChange} aria-label="basic tabs example" centered>
                    <Tab label="Use my annotations" {...a11yProps(0)} sx={{ px: 4 }} />
                    <Tab label="Perform annotations" {...a11yProps(1)} sx={{ px: 4 }} />
                </Tabs>
            </Box>
            <CustomTabPanel value={mode} index={0}>
                <SelectColumn />
                <MyTable />
                {
                    (annotationColumn != null && m2i.columns.includes(annotationColumn)) &&
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={e => handleCreateJob0()}
                        >
                            Create Job
                        </Button>
                    </Box>
                }
            </CustomTabPanel>
            <CustomTabPanel value={mode} index={1}>
                Perform annotations using CMM & TP (To be developed...)
            </CustomTabPanel>
        </Box>
    );
}