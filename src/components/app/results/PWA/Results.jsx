import { Box } from '@mui/material'
import React, { useState } from 'react'
import ModelInfo from './ModelInfo'
import ScatterPlot from './ScatterPlot'
import PathwayExplorer from './PathwayExplorer'
import HelpSectionTop from './HelpSection/HelpSectionTop';
import HelpSectionBottom from './HelpSection/HelpSectionBottom'

function Results({ pwa_res, runId, rId2info, view, workingOmics, mdataCategorical }) {

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ height: 0, width: 0, alignSelf: 'start' }}><HelpSectionTop/></Box>
                <Box sx={{ width: '50%', px: 3 }}>
                    <ModelInfo
                        runId={runId}
                        model_info={pwa_res.model_info}
                        view={view}
                        workingOmics={workingOmics}
                    />
                </Box>
                <Box sx={{ width: '50%', px: 3 }}>
                    <ScatterPlot
                        projections={pwa_res.projections}
                        nLV={pwa_res.model_info.LV.length}
                        mdataCategorical={mdataCategorical}
                    />
                </Box>
            </Box>
            <Box sx={{ mt: 4 }}>
                <Box sx={{width:0, height:0, position: 'relative', top:-35}}><HelpSectionBottom /></Box>
                <PathwayExplorer
                    view={view}
                    path_info={pwa_res.path_info}
                    rId2info={rId2info}
                    workingOmics={workingOmics}
                />
            </Box>
        </Box>
    )
}

export default Results