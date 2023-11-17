import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import PCAOmic from './PCAOmic'
import { MySectionContainer } from '@/components/MySection'

export default function PCA() {
    return (
        <Box>
            <Grid container>
                <Grid item xs={6}><MyHeader>Proteomics</MyHeader></Grid>
                <Grid item xs={6}><MyHeader>Metabolomics</MyHeader></Grid>
            </Grid>
            <MySectionContainer height="75vh">
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
            </MySectionContainer>
        </Box>
    )
}

const MyHeader = ({ children }) => {
    return (
        <Typography
            variant='h6'
            sx={{ textAlign: 'center', color: '#555555' }}
        >
            {children}
        </Typography>
    )
}