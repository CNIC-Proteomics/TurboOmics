import { useVars } from '@/components/VarsContext';
import { useJob } from '@/components/app/JobContext'
import { Box, Typography } from '@mui/material'
import React from 'react'

function HeatMapHeader({ nFeatRef }) {

    const { OMIC2NAME } = useVars();
    const omics = useJob().omics;

    return (
        <Box sx={{
            mt: 1,
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
        }}>
            <Box sx={{ width: '5%' }}></Box>
            {omics.map(omic => (<>
                {(nFeatRef.current[omic].up > 0 || nFeatRef.current[omic].down > 0) &&
                    <Box sx={{ marginRight: 0.5 }}>
                        <Box><Typography variant='h6'>{OMIC2NAME[omic]}</Typography></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            {nFeatRef.current[omic].down > 0 &&
                                <Box sx={{width: 1160 / (2*omics.length),marginRight: 0.5}}>
                                    <Box>Negatively Associated</Box>
                                </Box>
                            }
                            {nFeatRef.current[omic].up > 0 &&
                                <Box sx={{width: 1160 / (2*omics.length)}}>
                                    <Box>Positively Associated</Box>
                                </Box>
                            }
                        </Box>
                    </Box>
                }

            </>))
            }

        </Box>
    )
}

export default HeatMapHeader

/*
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
*/