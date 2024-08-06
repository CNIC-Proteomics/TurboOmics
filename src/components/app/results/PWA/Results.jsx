import { Box } from '@mui/material'
import React from 'react'
import ModelInfo from './ModelInfo'
import ScatterPlot from './ScatterPlot'

function Results({ pwa_res, runId, rId2info, view, workingOmics, mdataCategorical }) {

    console.log(pwa_res)
    //console.log(pwa_res.model_info)

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '50%' }}>
                    <ModelInfo
                        runId={runId}
                        model_info={pwa_res.model_info}
                        view={view}
                        workingOmics={workingOmics}
                    />
                </Box>
                <Box sx={{ width: '50%' }}>
                    <ScatterPlot
                        projections={pwa_res.projections}
                        nLV={pwa_res.model_info.LV.length}
                        mdataCategorical={mdataCategorical}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default Results