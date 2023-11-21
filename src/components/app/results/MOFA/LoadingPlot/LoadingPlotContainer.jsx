import { Box, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import LoadingPlot from './LoadingPlot';

function LoadingPlotContainer({ omic, fLVec, nFeatRef }) {

    return (
        <Box>
            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                {omic == 'q' ? 'Proteomics' : 'Metabolomics'}
            </Typography>
            <LoadingPlot
                omic={omic}
                fLVec={fLVec}
                nFeatRef={nFeatRef}
            />
        </Box>
    )
}

export default LoadingPlotContainer