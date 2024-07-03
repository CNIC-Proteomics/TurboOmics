import { Box } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import MetabolomicSetSelector from './MetabolomicSetSelector'
import GSEA from './GSEA'
import { useResults } from '@/components/app/ResultsContext'
import { useJob } from '@/components/app/JobContext'
import FieldSelector from './FieldSelector'

import { MetaboID } from '@/utils/MetaboID'
import { useVars } from '@/components/VarsContext'

// constants
const idTypeOpts = [
    { label: 'KEGG', id: 'KEGG' },
    { label: 'ChEBI', id: 'ChEBI' },
    { label: 'PubChem (CID)', id: 'PubChem' },
    { label: 'HMDB', id: 'HMDB' }
]

// Main component

function EnrichmentM({ fRef, f2MeanL, colFid, setColFid, setM2Cat }) {

    const {API_URL} = useVars();
    const { m2i } = useJob().user;
    const m2x = useJob().f2x.m;
    const {OS} = useJob();
   
    // Select columns from m2i to get ID
    const f2iColumns = useMemo(
        () => m2i.columns.map(e => ({ label: e, id: e })),
        [m2i]);

    // Metabolomics ID type selected
    const [idType, setIdType] = useState(idTypeOpts[0]);

    //const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    //const mdataColInfo = useJob().mdataType[mdataCol];

    // Handle change on column containing ID or ID_type
    useEffect(() => {

        if (colFid === null) return

        const ORAinput = {};

        // Get ORA input for selected ID type
        let midTargetArr = fRef.map(e => e[colFid.id]).filter(e => e);

        let midArr = m2i.column(colFid.id).values.filter((e, i) => e && m2x[i]);
        
        if (['ChEBI', 'PubChem'].includes(idType.id)) {
            midTargetArr = midTargetArr.map(e => Number(e).toString());
            midArr = midArr.map(e => Number(e).toString());
        }
               
        midArr = midArr.map(e => ({ id: e, target: midTargetArr.includes(e) }))

        // Obtain map index of user metabolites
        const midIndex = midArr.map(e => MetaboID[idType.id].indexOf(e.id));

        // if no map was obtained go out
        if (midIndex.every(e => e == -1)) {
            console.log('No index found');
            return
        }
        // Build object to be sent to back-end
        ['KEGG', 'ChEBI'].map(db => {
            ORAinput[db] = midIndex
            .map((e, i) => ({ id: MetaboID[db][e], target: midArr[i].target }))
            .filter( e => e.id)
        });

        fetch(
            `${API_URL}/run_ora/${OS['scientific_name']}`,
            {
                method: 'POST',
                body: JSON.stringify(ORAinput)
            }
        )
        .then(res => res.json())
        .then(resJson => console.log(resJson));

    }, [colFid, idType]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <FieldSelector
                    options={f2iColumns}
                    selectedField={colFid}
                    setSelectedField={(newValue) => setColFid(newValue)}
                >
                    Select Column Containing ID
                </FieldSelector>
                <Box sx={{ width: 10 }} />
                <FieldSelector
                    options={idTypeOpts}
                    selectedField={idType}
                    setSelectedField={(newValue) => setIdType(newValue)}
                >
                    Select ID Type
                </FieldSelector>
            </Box>
        </Box>
    )
}

export default EnrichmentM