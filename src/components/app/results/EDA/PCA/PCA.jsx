import { Box, Grid, Typography } from '@mui/material'
import React, { useRef, useState } from 'react'
import PCAOmic from './PCAOmic'
import { MySectionContainer } from '@/components/MySection'
import { useJob } from '@/components/app/JobContext'
import { useVars } from '@/components/VarsContext'
import OmicSelector from '../DataDistribution/OmicSelector';

export default function PCA() {

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
                <Box sx={{ display: 'flex', width: `${omics.length}00%` }} >
                    {omics.map(omic => (
                        <Box
                            key={omic}
                            sx={{
                                width: `${100 / omics.length}%`,
                                opacity: omic == selOmic ? 1 : 0,
                                transition: 'all 1s ease'
                            }}
                        >
                            <PCAOmic omic={omic} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}