import React, { useRef, useState } from 'react'
import { useJob } from '../../JobContext'
import { Box } from '@mui/material'
import OmicSelector from '../EDA/DataDistribution/OmicSelector';
import GSEAomic from './GSEAomic';

function GSEA() {

    const { omics } = useJob();
    const [selOmic, setSelOmic] = useState(omics[0]);
    const omicViewRef = useRef();

    return (
        <Box>
            <OmicSelector
                selOmic={selOmic}
                setSelOmic={setSelOmic}
                omicViewRef={omicViewRef}
            />
            <Box ref={omicViewRef} sx={{ overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', width: `${omics.length}00%` }}>
                    {omics.map(omic => (
                        <Box
                            key={omic}
                            sx={{
                                width: `${100 / omics.length}%`,
                                opacity: omic == selOmic ? 1 : 0,
                                transition: 'all 1s ease'
                            }}
                        >
                            <GSEAomic omic={omic} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

export default GSEA