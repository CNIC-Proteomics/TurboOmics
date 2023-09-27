import { useVars } from '@/components/VarsContext'
import { Button } from '@mui/material'
import React from 'react'
import { useDispatchJob } from '../JobContext'

export default function LoadSampleBtn({ children, page }) {

    const API_URL = useVars().API_URL
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
        <div className='align-self-center' style={{ position: 'absolute', left: '10%' }}>
            <Button
                variant='outlined'
                startIcon={children}
                onClick={handleClick}
            >
                Load Sample Data
            </Button>
        </div>
    )
}
