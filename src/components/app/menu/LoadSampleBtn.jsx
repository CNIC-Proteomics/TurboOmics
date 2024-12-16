import { useVars } from '@/components/VarsContext'
import { Box, Button, Link } from '@mui/material'
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
                dfJson: resJson[key],
                idCol: Object.keys(resJson[key][0])[0]
            });
        })
    }

    const handleDownload = () => {
        fetch(`${API_URL}/download_sample_data`)
            .then((res) => {
                return res.blob();
            })
            .then((blob) => {
                const href = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = href;
                link.setAttribute('download', 'TurboOmics-SampleData.zip');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((err) => {
                return Promise.reject({ Error: 'Something Went Wrong', err });
            })
    }

    return (
        <Box sx={{ alignSelf: 'center', position: 'absolute', left: '10%', pt: 3 }}>
            <Box>
                <Button
                    variant='outlined'
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleClick}
                >
                    Load Sample Data
                </Button>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link href='#' onClick={handleDownload}>
                    Download Sample Data
                </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link
                    href='https://github.com/CNIC-Proteomics/TurboOmics/blob/main/LICENSE.md'
                    target='_blank'
                >
                    License
                </Link>
            </Box>
        </Box>
    )
}
