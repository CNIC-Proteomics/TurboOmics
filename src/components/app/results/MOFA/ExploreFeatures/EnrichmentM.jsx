import { Box } from '@mui/material'
import React from 'react'
import MetabolomicSetSelector from './MetabolomicSetSelector'
import GSEA from './GSEA'

function EnrichmentM() {
    return (
        <Box sx={{ display: 'flex' }}>
            <Box sx={{ width: '45%' }}>
                <MetabolomicSetSelector />
            </Box>
            <Box sx={{ width: '45%' }}>
                {false && <GSEA />}
            </Box>
        </Box>)
}

export default EnrichmentM