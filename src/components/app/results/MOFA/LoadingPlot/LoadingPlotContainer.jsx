import { Box, Grid, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import LoadingPlot from './LoadingPlot';
import { useJob } from '@/components/app/JobContext';
import { useVars } from '@/components/VarsContext';

function LoadingPlotContainer({ fLVec, nFeatRef, thrLRef, plotHeatMap }) {

    const { omics } = useJob();
    const { OMIC2NAME } = useVars();

    return (
        <Box sx={{ my: 3, display:'flex', justifyContent:'space-evenly' }} >
            {omics.map((omic,i) => (
                <Box key={i} sx={{width:`31%`}}>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>
                        {OMIC2NAME[omic]}
                    </Typography>
                    <LoadingPlot
                        omic={omic}
                        fLVec={fLVec[omic]}
                        nFeatRef={nFeatRef}
                        thrLRef={thrLRef}
                        plotHeatMap={plotHeatMap}
                    />
                </Box>
            ))}
        </Box >
    )
}

export default LoadingPlotContainer