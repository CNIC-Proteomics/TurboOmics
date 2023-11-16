import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import SelectorFactor2D from './SelectorFactor2D'
import ScatterModeSelector from './ScatterModeSelector'

function ScatterPlotContainer({
    scatterMode,
    setScatterMode,
    selectedPlot,
    selectedPlot2D,
    setSelectedPlot2D,
    factorNames,
    rowNames,
    projections
}) {
    return (
        <Grid container sx={{ border: '1px solid red' }}>
            <Grid sx={{pt:2}} item xs={6}>
                <ScatterModeSelector
                    scatterMode={scatterMode}
                    setScatterMode={setScatterMode}
                    disable2D={Object.keys(Object.values(projections)[0]).length<2}
                />

                <Box sx={{ px:3, pt:7, textAlign: 'center' }}>
                    {scatterMode == '1D' ?
                        <Box sx={{ height: 75, pt: 3 }}>
                            <Typography variant='body1'>Select a pvalue cell to plot Factor</Typography>
                        </Box>
                        :
                        <SelectorFactor2D
                            factorNames={factorNames}
                            rowNames={rowNames}
                            selectedPlot2D={selectedPlot2D}
                            setSelectedPlot2D={setSelectedPlot2D}
                        />
                    }
                </Box>
            </Grid>

            <Grid item xs={6}>

                <Box sx={{ height: 400, border: '1px solid blue' }}>
                    {scatterMode == '1D' ?
                        <Box>1D scatter</Box> :
                        <Box>2D scatter</Box>
                    }
                </Box>
            </Grid>

        </Grid>
    )
}

export default ScatterPlotContainer