import { Box, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import LoadingPlot from './LoadingPlot';

function LoadingPlotContainer({ omic, loadings, factorName }) {

    const [thrL, setThrL] = useState();

    const fLVec = useMemo(() => {
        let fLVec = Object.keys(loadings).map(e => [e, loadings[e]]);
        fLVec.sort((a, b) => a[1] - b[1]);
        fLVec = fLVec.map((e, i) => [...e, (i + 1) / fLVec.length]);

        setThrL({
            down: fLVec[Math.ceil(fLVec.length*0.01)][1],
            up: fLVec[Math.floor(fLVec.length*0.99)][1]
        })

        return fLVec
    }, [loadings, factorName]);

    return (
        <Box sx={{}}>
            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                {omic == 'q' ? 'Proteomics' : 'Metabolomics'}
            </Typography>
            <LoadingPlot
                fLVec={fLVec}
                omic={omic}
                thrL={thrL}
                setThrL={setThrL}
            />
        </Box>
    )
}

export default LoadingPlotContainer