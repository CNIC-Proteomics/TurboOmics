import { Box } from '@mui/material'
import React from 'react'
import ModelInfo from './ModelInfo'

function Results({ pwa_res, rId2info }) {

    console.log(pwa_res)
    //console.log(pwa_res.model_info)

    return (
        <Box>
            <Box sx={{display: 'flex'}}>
                <Box>
                    <ModelInfo model_info={pwa_res.model_info} />
                </Box>
            </Box>
        </Box>
    )
}

export default Results