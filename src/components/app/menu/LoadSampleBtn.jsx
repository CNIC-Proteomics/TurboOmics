import { useVars } from '@/components/VarsContext'
import { Box, Button } from '@mui/material'
import React from 'react'
import { useDispatchJob } from '../JobContext'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';


export default function LoadSampleBtn() {

    const { API_URL } = useVars();
    const dispatchJob = useDispatchJob();

    const handleClick = async e => {
        console.log(`Loading sample data`);

        // Fetch data from server
        const res = await fetch(`${API_URL}/load_sample_data`);
        const resJson = await res.json();

        // Update Job state
        Object.keys(resJson).forEach(key => {
            dispatchJob({ // save danfo df
                type: 'user-upload',
                fileType: key,
                userFileName: `${key}.tsv`,
                dfJson: resJson[key]
            });
        })
    }

    return (
        <Box sx={{ alignSelf: 'center', position: 'absolute', left: '10%' }}>
            <Button
                variant='outlined'
                startIcon={<CloudDownloadIcon />}
                onClick={handleClick}
            >
                Load Sample Data
            </Button>
        </Box>
    )
}
