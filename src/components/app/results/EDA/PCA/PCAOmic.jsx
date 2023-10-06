import { useVars } from '@/components/VarsContext'
import { useJob } from '@/components/app/JobContext'
import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

export default function PCAOmic({ title, omic }) {

    const [data, setData] = useState({
        projections: null,
        loadings: null,
        explained_variance: null,
        anova: null
    });

    const {projections, loadings, explained_variance, anova} = data;    

    const {jobID} = useJob();
    const { API_URL } = useVars();

    useEffect(() => {
        console.log('Get PCA and ANOVA data');

        const fetchData = async () => {
            const res = await fetch(`${API_URL}/get_eda_pca/${jobID}/${omic}`);
            const resJson = await res.json();
            console.log(resJson);
            setData(resJson);
        }

        fetchData();

    }, []);

    return (
        <Box sx={{ borderRight: omic == 'q' ? '1px solid #cccccc' : '0px' }}>
            <Typography
                variant='h6'
                sx={{ textAlign: 'center', color: '#555555' }}
            >
                {title}
            </Typography>

        </Box>
    )
}
