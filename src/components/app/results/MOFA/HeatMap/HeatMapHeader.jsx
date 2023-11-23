import { Box, Typography } from '@mui/material'
import React from 'react'

function HeatMapHeader({ nFeatRef }) {
    return (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <Box sx={{ width: '5%'}}></Box>
            <Box>
                {(nFeatRef.current.q.up > 0 || nFeatRef.current.q.down > 0) &&
                    <Box>
                        <Box><Typography variant='h6'>Proteomics</Typography></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            {nFeatRef.current.q.down > 0 &&
                                <Box sx={{ width: 290 }}>Negatively Associated</Box>
                            }
                            {nFeatRef.current.q.up > 0 &&
                                <Box sx={{ width: 290 }}>Positively Associated</Box>
                            }
                        </Box>
                    </Box>
                }
            </Box>
            <Box>
                {(nFeatRef.current.m.up > 0 || nFeatRef.current.m.down > 0) &&
                    <Box>
                        <Box><Typography variant='h6'>Metabolomics</Typography></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            {nFeatRef.current.m.down > 0 &&
                                <Box sx={{ width: 290 }}>Negatively Associated</Box>
                            }
                            {nFeatRef.current.m.up > 0 &&
                                <Box sx={{ width: 290 }}>Positively Associated</Box>
                            }
                        </Box>
                    </Box>
                }
            </Box>
        </Box>
    )
}

export default HeatMapHeader

