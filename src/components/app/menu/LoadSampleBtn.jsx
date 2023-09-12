import { useVars } from '@/components/VarsContext'
import { Button } from '@mui/material'
import React from 'react'
import { useDispatchJob } from '../JobContext'

export default function LoadSampleBtn({ children, page }) {
    if (page != 'new-job') return <></>

    const API_URL = useVars().API_URL
    const dispatchJob = useDispatchJob();

    const handleClick = async e => {
        console.log(`Loading sample data`);
        
        // Fetch data from server
        const res = await fetch(`${API_URL}/load_sample_data`);
        const resJson = await res.json();

        // Create Danfo dataframe
        const resDf = {}
        Object.keys(resJson).forEach(key => {
            resDf[key] = new dfd.DataFrame(resJson[key]);
            resDf[key].setIndex({ column: resDf[key].columns[0], inplace: true });
            resDf[key].drop({ columns: [resDf[key].columns[0]], inplace: true });
        });

        // Update Job state
        Object.keys(resJson).forEach(key => {
            dispatchJob({ // save dando df
                type: 'user-upload',
                fileType: key,
                userFileName: `${key}.tsv`,
                df: resDf[key]
            });

            if (key == 'xq' || key == 'xm') {
                dispatchJob({ // get and save MV plot data
                    type: 'get-mv-data',
                    fileType: key,
                    df: resDf[key]
                })
            }
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
