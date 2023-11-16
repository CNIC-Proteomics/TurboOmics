import { useDispatchJob } from '@/components/app/JobContext';
import { useDispatchResults } from '@/components/app/ResultsContext';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react'

function ScatterModeSelector({scatterMode, setScatterMode, disable2D}) {
    
    const dispatchResults = useDispatchResults()

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                    color="primary"
                    value={scatterMode}
                    exclusive
                    onChange={(e, mode) => {
                        setScatterMode(e.target.value);
                        dispatchResults({ type: 'set-scatter-mode-mofa', mode: e.target.value });
                    }}
                    aria-label="Platform"
                >
                    <ToggleButton value="1D">1D</ToggleButton>
                    <ToggleButton value="2D" disabled={disable2D}>2D</ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </Box>
    )
}

export default ScatterModeSelector

