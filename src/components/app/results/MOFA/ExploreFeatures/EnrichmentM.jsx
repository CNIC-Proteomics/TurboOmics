import { Box, Button } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useJob } from '@/components/app/JobContext'
import FieldSelector from './FieldSelector'
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

import { useVars } from '@/components/VarsContext'

import dynamic from 'next/dynamic';
const CategoryTable = dynamic(
    () => import('./EnrichmentMTables/CategoryTable')
);
const MetaboliteCategoryTable = dynamic(
    () => import('./EnrichmentMTables/MetaboliteCategoryTable')
);

//import CategoryTable from './EnrichmentMTables/CategoryTable'
//import MetaboliteCategoryTable from './EnrichmentMTables/MetaboliteCategoryTable'


//import { MetaboID } from '@/utils/MetaboID'

// constants
const idTypeOpts = [
    { label: 'KEGG', id: 'KEGG' },
    { label: 'ChEBI', id: 'ChEBI' },
    { label: 'PubChem (CID)', id: 'PubChem' },
    { label: 'HMDB', id: 'HMDB' }
]

// Main component

function EnrichmentM({ fRef, f2MeanL, colFid, setColFid, setM2cat, MetaboID }) {

    const { jobID } = useJob();
    const { API_URL } = useVars();
    const { m2i } = useJob().user;
    const m2x = useJob().f2x.m;
    const { OS } = useJob();


    /*
    Parameters to select column and ID type
    */

    // Select columns from m2i to get ID
    const f2iColumns = useMemo(
        () => m2i.columns.map(e => ({ label: e, id: e })),
        [m2i]);

    // Metabolomics ID type selected
    const [idType, setIdType] = useState(idTypeOpts[0]);

    /**/

    /*
    Get enrichment from myORA.py
    */

    const isIntegerID = useMemo(() => ['ChEBI', 'PubChem'].includes(idType.id), [idType])
    const [resORA, setResORA] = useState([]);

    const { midTargetArr, midArr, midIndex, db2usr } = useMemo(() => {
        let midTargetArr, midArr, midIndex;
        let db2usr = {};

        if (colFid) {
            // Get ORA input for selected ID type
            midTargetArr = fRef.map(e => e[colFid.id]).filter(e => e);

            midArr = m2i.column(colFid.id).values.filter((e, i) => e && m2x[i]);

            // Convert id to integer string
            if (isIntegerID) {
                midTargetArr = midTargetArr.map(e => Number(e).toString());
                midArr = midArr.map(e => {
                    let i = Number(e).toString();
                    db2usr[i] = e;
                    return i
                });
            } else {
                midArr.map(e => db2usr[e] = e);
            }

            midArr = midArr.map(e => ({ id: e, target: midTargetArr.includes(e) }))

            // Obtain map index of user metabolites
            midIndex = midArr.map(e => MetaboID[idType.id].indexOf(e.id));
        }

        return { midTargetArr, midArr, midIndex, db2usr }

    }, [colFid, idType, isIntegerID, fRef, m2i, m2x, MetaboID]);

    // Handle change on column containing ID or ID_type
    useEffect(() => {

        if (colFid === null) return

        const ORAinput = {};

        // if no map was obtained go out
        if (midIndex.every(e => e == -1)) {
            console.log('No index found');
            setResORA([]);
            return
        }
        // Build object to be sent to back-end
        ['KEGG', 'ChEBI'].map(db => {
            ORAinput[db] = midIndex
                .map((e, i) => ({ id: MetaboID[db][e], target: midArr[i].target }))
                .filter(e => e.id)
        });

        fetch(
            `${API_URL}/run_ora/${jobID}/${OS['scientific_name']}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ORAinput)
            }
        )
            .then(res => res.json())
            .then(resJson => {
                resJson.KEGG = resJson.KEGG.map(e => ({
                    ...e, name: e.name.split(' - ').slice(0, -1).join(' - ')
                }));
                let myResORA = [];
                Object.keys(resJson).map(db => {
                    resJson[db].map(e => myResORA.push({
                        ...e, pvalue: Math.round(e.pvalue * 1000) / 1000, db: db
                    }))
                })
                setResORA(myResORA.filter(e => e.N_pathway_sig > 0));
            });

    }, [midIndex, midArr, colFid, API_URL, OS, jobID, MetaboID]);

    /**/

    /*
    Store categories selected by user
    */

    const [category, setCategory] = useState(null);
    const [myUsrFilt, setMyUsrFilt] = useState([]);

    useEffect(() => {
        console.log('setM2Cat');

        if (!colFid) return;

        const myM2Cat = {};
        midTargetArr.map(e => myM2Cat[db2usr[e]] = []);

        let resORAfilt = resORA.filter(e => myUsrFilt.includes(e.id));
        resORAfilt.map(cat => {
            cat.pathway_sig.map(tid => {
                const i = MetaboID[idType.id][MetaboID[cat.db].indexOf(tid)]
                if (i && midTargetArr.includes(i)) {
                    myM2Cat[db2usr[i]].push({
                        native: cat.id, name: cat.name
                    })
                }
            })
        });

        setM2cat(myM2Cat)
    }, [myUsrFilt, midTargetArr, resORA, idType, colFid, db2usr, setM2cat, MetaboID]);

    /*
    Loading Metabolite Category Table
    */
    const [showLoading, setShowLoading] = useState(true);

    return (
        <Box sx={{}}>
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
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
            {colFid &&
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box sx={{ width: '65%' }}>
                        <CategoryTable
                            myData={resORA}
                            setCategory={setCategory}
                            myUsrFilt={myUsrFilt}
                            setMyUsrFilt={setMyUsrFilt}
                        />
                    </Box>
                    <Box sx={{ width: '30%', display:'flex', justifyContent:'center', border:'0px solid blue' }}>
                        {category &&
                            <>
                                {showLoading &&
                                    <Box sx={{border:'0px solid red', alignSelf: 'center', width:'80%'}}>
                                        <Box>Loading Metabolites...</Box>
                                        <Box sx={{p:4}}><LinearProgress /></Box>
                                    </Box>
                                }
                                <MetaboliteCategoryTable
                                    mCat={category}
                                    idType={idType}
                                    setShowLoading={setShowLoading}
                                />
                            </>
                        }
                    </Box>
                </Box>
            }
        </Box>
    )
}

export default EnrichmentM