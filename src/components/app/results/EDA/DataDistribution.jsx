import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid';
//import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import React from 'react'

export default function DataDistribution() {
    return (
        <Box sx={{ flexGrow: 1, p: 1 }}>
            <Grid
                container
                direction='row'
                justifyContent='center'
                alignItems='center'
                spacing={2}
                sx={{ p: 1 }}
            >

                <Grid item sx={{ borderRight: '1px solid #cccccc' }} xs={6}>
                    <Box>
                        <Typography variant='h6' sx={{ textAlign: 'center', color:'#555555' }}>Proteomics</Typography>
                    </Box>
                </Grid>

                <Grid item xs={6} sx={{ borderLeft: '1px solid #cccccc' }}>
                    <Typography variant='h6' sx={{ textAlign: 'center', color:'#555555' }}>Metabolomics</Typography>
                </Grid>

            </Grid>
        </Box>
    )
}
