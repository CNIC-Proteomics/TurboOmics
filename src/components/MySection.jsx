import { Box } from '@mui/material'
import React from 'react'

export function MySection({ children }) {
    return (
        <Box style={{ scrollSnapAlign: 'center', border: '1px solid yellow' }}>
            {children}
        </Box>
    )
}

export function MySectionContainer({ children, height }) {
    return (
        <Box sx={{ height: {height}, scrollSnapType: 'y mandatory', overflow: 'auto' }}>
            {children}
        </Box>

    )
}