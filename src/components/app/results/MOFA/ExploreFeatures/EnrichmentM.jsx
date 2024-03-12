import { Box } from '@mui/material'
import React, { useRef, useState } from 'react'
import MetabolomicSetSelector from './MetabolomicSetSelector'
import GSEA from './GSEA'
import { useResults } from '@/components/app/ResultsContext'
import { useJob } from '@/components/app/JobContext'

function EnrichmentM({ fRef, f2MeanL, setLoadingEnrichment }) {

    const [mCat, setMCat] = useState(null);
    const updateMCat = (myMCat) => setMCat(myMCat);

    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ width: '45%' }}>
                <MetabolomicSetSelector
                    setLoadingEnrichment={setLoadingEnrichment}
                    fRef={fRef}
                    updateMCat={updateMCat}
                />
            </Box>
            {false && <Box sx={{ width: '45%' }}>
                {
                    mdataColInfo.type == 'categorical' &&
                    mdataColInfo.levels.length > 1 &&
                    mCat &&
                    <>
                        <GSEA
                            f2MeanL={f2MeanL}
                            fSet={mCat}
                            omic='m'
                        />
                    </>
                }
            </Box>}
        </Box>
    )
}

export default EnrichmentM