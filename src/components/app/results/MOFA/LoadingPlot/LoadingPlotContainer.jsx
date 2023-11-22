import { Box, Grid, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import LoadingPlot from './LoadingPlot';

function LoadingPlotContainer({ fLVec, nFeatRef, plotHeatMap }) {
    return (
        <Grid sx={{ mt: 2 }} container>
            {['q', 'm'].map(omic => (
                <Grid item key={omic} xs={6}>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>
                        {omic == 'q' ? 'Proteomics' : 'Metabolomics'}
                    </Typography>
                    <LoadingPlot
                        omic={omic}
                        fLVec={fLVec[omic]}
                        nFeatRef={nFeatRef}
                        plotHeatMap={plotHeatMap}
                    />
                </Grid>
            ))}
        </Grid >
    )
}

export default LoadingPlotContainer