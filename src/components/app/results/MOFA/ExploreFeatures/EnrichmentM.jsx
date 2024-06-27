import { Box } from '@mui/material'
import React, { useMemo, useRef, useState } from 'react'
import MetabolomicSetSelector from './MetabolomicSetSelector'
import GSEA from './GSEA'
import { useResults } from '@/components/app/ResultsContext'
import { useJob } from '@/components/app/JobContext'
import FieldSelector from './FieldSelector'

function EnrichmentM({ fRef, f2MeanL, colFid, setColFid }) {

    //const [mCat, setMCat] = useState(null);
    //const updateMCat = (myMCat) => setMCat(myMCat);

    const { m2i } = useJob().user;
    const f2iColumns = useMemo(
        () => m2i.columns.map(e => ({ label: e, id: e })),
        [m2i]);

    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <FieldSelector
                    options={f2iColumns}
                    selectedField={colFid.kegg}
                    setSelectedField={(newValue) => setColFid(prev => ({ ...prev, kegg: newValue }))}
                >
                    Select Column Containing KEGG ID
                </FieldSelector>
                <Box sx={{ width: 10 }} />
                { false && <FieldSelector
                    options={f2iColumns}
                    selectedField={colFid.chebi}
                    setSelectedField={(newValue) => setColFid(prev => ({ ...prev, chebi: newValue }))}
                >
                    Select Column Containing ChEBI ID
                </FieldSelector>}
            </Box>
        </Box>
    )
}

export default EnrichmentM