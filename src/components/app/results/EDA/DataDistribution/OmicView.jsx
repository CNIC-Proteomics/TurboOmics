import { MySection } from '@/components/MySection'
import { useVars } from '@/components/VarsContext'
import { Box, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'


import React from 'react'
import downloadImage from './downloadImage'
import PlotData from './PlotData'
import FilterFeatures from './FilterFeatures'

function OmicView({
    omic,
    figRef,
    showPlot,
    showNorm,
    filteredID,
    setFilteredID,
    updatePlot,
    groupby }) {

    const { OMIC2NAME } = useVars();

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'flex-start'
            }}>
                <Box sx={{ width: '45%', height:'600px', pt:4 }}>
                    <Typography
                        variant='h6'
                        sx={{ textAlign: 'center', color: '#555555' }}
                    >
                        Data Distribution
                        <IconButton
                            aria-label="download"
                            size='small'
                            onClick={e => downloadImage(
                                figRef.current[omic]['Hist'],
                                figRef.current[omic]['Box'],
                                OMIC2NAME[omic]
                            )}
                            sx={{
                                opacity: 0.5,
                                visibility: showPlot[omic] ? 'visible' : 'hidden',
                                paddingBottom: 1
                            }}
                        >
                            <ImageIcon />
                        </IconButton>
                    </Typography>
                    {showPlot[omic] ?
                        <Box sx={{ height: 500, overflow: 'hidden', mt:3 }}>
                            <PlotData
                                omic={omic}
                                fileType={`x${omic}`}
                                filteredID={filteredID}
                                groupby={groupby}
                                showNorm={showNorm}
                                figRef={figRef}
                            />
                        </Box>
                        :
                        <Box sx={{ textAlign: 'center', pt: 20, height: 550 }}>
                            <CircularProgress size={100} thickness={2} />
                        </Box>
                    }
                </Box>
                <Box sx={{ width: '45%', height:'600px' }}>
                    <FilterFeatures
                        omic={omic}
                        fileType={`${omic}2i`}
                        setFilteredID={setFilteredID}
                        updatePlot={updatePlot}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default OmicView