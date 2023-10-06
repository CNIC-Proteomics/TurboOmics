import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import PCAOmic from './PCAOmic'

export default function PCA() {
    return (
        <Box>
            <Grid container>
                <Grid item xs={6}>
                    <PCAOmic
                        title='Proteomics'
                        omic='q'
                    />
                </Grid>
                <Grid item xs={6}>
                    <PCAOmic
                        title='Metabolomics'
                        omic='m'
                    />
                </Grid>
            </Grid>
        </Box>
    )
}
