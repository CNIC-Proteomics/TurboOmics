import { Box } from '@mui/material'
import React from 'react'

export function MySection({ children, sx }) {
    return (
        <Box sx={{...sx}} style={{ scrollSnapAlign: 'center', border: '0px solid yellow' }}>
            {children}
        </Box>
    )
}

export function MySectionContainer({ children, height }) {
    return (
        <Box sx={{ height: {height}, scrollSnapType: 'y mandatory', overflow: 'auto', border:'0px solid red' }}>
            {children}
        </Box>

    )
}