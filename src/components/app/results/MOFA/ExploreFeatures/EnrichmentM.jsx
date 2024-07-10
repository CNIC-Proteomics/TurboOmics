import { Box, Button } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import MetabolomicSetSelector from './MetabolomicSetSelector'
import GSEA from './GSEA'
import { useResults } from '@/components/app/ResultsContext'
import { useJob } from '@/components/app/JobContext'
import FieldSelector from './FieldSelector'
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { MetaboID } from '@/utils/MetaboID'
import { useVars } from '@/components/VarsContext'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

// constants
const idTypeOpts = [
    { label: 'KEGG', id: 'KEGG' },
    { label: 'ChEBI', id: 'ChEBI' },
    { label: 'PubChem (CID)', id: 'PubChem' },
    { label: 'HMDB', id: 'HMDB' }
]

// Main component

function EnrichmentM({ fRef, f2MeanL, colFid, setColFid, setM2cat }) {

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

        return {midTargetArr, midArr, midIndex, db2usr}

    }, [colFid, idType, isIntegerID, fRef, m2i, m2x]);

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

    }, [midIndex, midArr, colFid, API_URL, OS, jobID]);

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
    }, [myUsrFilt, midTargetArr, resORA, idType, colFid, db2usr, setM2cat])

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
                    <Box sx={{ width: '30%' }}>
                        {category &&
                            <MetaboliteCategoryTable
                                mCat={category}
                                idType={idType}
                            />
                        }
                    </Box>
                </Box>
            }
        </Box>
    )
}

const CategoryTable = ({ myData, setCategory, myUsrFilt, setMyUsrFilt }) => {
    const handleExportData = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `Metabolite_Enrichment`
        });

        const data = myData.map(e => ({
            'ID': e.id,
            'Type': e.db,
            'Name': e.name,
            'pvalue': e.pvalue,
            'FDR': e.FDR,
            'N. mapped': e.N_pathway_mapped,
            'N. target': e.N_pathway_sig
        }));

        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };
    const columns = useMemo(() => ([
        {
            header: 'ID',
            accessorKey: 'id',
            size: 100,
        },
        {
            header: 'Type',
            accessorKey: 'db',
            size: 120,
            filterVariant: 'multi-select'
        },
        {
            header: 'Name',
            accessorKey: 'name',
            size: 220,
        },
        {
            header: 'pvalue',
            accessorKey: 'pvalue',
            size: 100,
            filterFn: 'lessThan',
        },
        {
            header: 'FDR',
            accessorKey: 'FDR',
            size: 80,
            filterFn: 'lessThan'
        },
        {
            header: 'N. Backg.',
            accessorKey: 'N_pathway_mapped',
            size: 100,
            //filterFn: 'lessThan'
        },
        {
            header: 'N. Target',
            accessorKey: 'N_pathway_sig',
            size: 100,
            //filterFn: 'lessThan'
        },
    ]), []);

    // Row selection for GSEA
    const initialSelectedRow = useMemo(() => {
        return myData.length > 0 ? { [myData[0].id]: true } : {}
    }, [myData]);
    const [rowSelection, setRowSelection] = useState(initialSelectedRow);

    useEffect(() => {
        if (Object.keys(rowSelection).length == 0) {
            setCategory(null);
        } else {
            setCategory(
                myData.filter(e => e.id == Object.keys(rowSelection)[0])[0]
            );
        };
    }, [rowSelection, myData, setCategory]);

    const table = useMaterialReactTable({
        columns,
        data: myData, //10,000 rows
        //defaultDisplayColumn: { enableResizing: true },
        layoutMode: 'grid',
        enableBottomToolbar: false,
        enableColumnResizing: true,
        //enableColumnVirtualization: true,
        //enableGlobalFilterModes: true,
        enablePagination: false,
        enableColumnPinning: false,
        enableRowNumbers: false,
        //enableRowVirtualization: true,
        enableRowActions: false,
        enableRowSelection: true,
        enableMultiRowSelection: false,
        enableDensityToggle: false,
        enableColumnFilters: true,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnActions: false,
        muiTableContainerProps: { sx: { maxHeight: '330px', minHeight: '330px' } },
        //onSortingChange: setSorting,
        enableFacetedValues: true,
        initialState: {
            density: 'compact',
            showGlobalFilter: true,
            showColumnFilters: true,
            columnFilters: [{ id: 'pvalue', value: 0.05 }],
            rowSelection: { initialSelectedRow },
            sorting: [{ id: 'pvalue', desc: false }]
        },
        positionToolbarAlertBanner: 'bottom', //move the alert banner to the bottom
        getRowId: (row) => row.id, //give each row a more useful id
        muiTableBodyRowProps: ({ row }) => ({
            //add onClick to row to select upon clicking anywhere in the row
            onClick: row.getToggleSelectedHandler(),
            sx: { cursor: 'pointer' },
        }),
        onRowSelectionChange: setRowSelection, //connect internal row selection state to your own
        state: { rowSelection },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={handleExportData}
                    startIcon={<FileDownloadIcon />}
                >
                    Export All Data
                </Button>
            </Box>
        )
    });

    // Capture user filter
    const [usrFilt, setUsrFilt] = useState(myData.map(e => e.native));
    const newUsrFilt = table.getFilteredRowModel().rows.map(e => e.id);

    if (
        !usrFilt.every(e => newUsrFilt.includes(e)) ||
        !newUsrFilt.every(e => usrFilt.includes(e))
    ) {
        setUsrFilt(newUsrFilt);
    }

    useEffect(() => {
        console.log('Setting ID')
        if (
            !myUsrFilt.every(e => usrFilt.includes(e)) ||
            !usrFilt.every(e => myUsrFilt.includes(e))
        ) {
            setMyUsrFilt(usrFilt)
        }
    }, [usrFilt, setMyUsrFilt, myUsrFilt]);

    return (
        <MaterialReactTable table={table} />
    )
};

const MetaboliteCategoryTable = ({ mCat, idType }) => {

    const idCol = idType.id; // useJob().user.q2i.columns[0];

    const { myData, mySet } = useMemo(() => {
        let myData = [];

        mCat.pathway_mapped.map(e => {
            const eidx = MetaboID[mCat.db].indexOf(e);
            myData.push({
                'ID': MetaboID[idCol][eidx],
                'Name': MetaboID['Name'][eidx],
                'Target': mCat.pathway_sig.includes(e)
            });
        });
        myData.sort((a, b) => (b.Target - a.Target));

        let mySet = {};
        myData.map(e => { if (e.Target) mySet[e.ID] = true });
        return { myData, mySet }
    }, [mCat, idCol]);

    const columns = useMemo(() => ([
        {
            header: 'ID',
            accessorKey: 'ID',
            size: 60
        },
        {
            header: 'Name',
            accessorKey: 'Name',
            size: 60
        },
    ]), []);

    const handleExportData = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `CategoryMetabolites`
        });

        const data = myData.map(e => ({
            'ID': e.ID,
            'Name': e.Name,
            'Filtered': e.Target
        }));

        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    const rowVirtualizerInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState([]);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        //scroll to the top of the table when the sorting changes
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting]);

    const table = useMaterialReactTable({
        columns,
        data: myData,
        layoutMode: 'grid',
        enableBottomToolbar: true,
        positionToolbarAlertBanner: 'bottom',
        enableSelectAll: false,
        enablePagination: false,
        enableRowPinning: false,
        enableRowSelection: false,
        enableStickyHeader: true,
        enableColumnPinning: false,
        enableDensityToggle: false,
        enableColumnFilters: false,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnActions: false,
        rowPinningDisplayMode: 'select-sticky',
        muiTableContainerProps: { sx: { maxHeight: '250px', minHeight: '250px' } },
        enableRowVirtualization: true,
        enableColumnVirtualization: true,
        getRowId: (row) => row.ID,
        state: {
            rowSelection: mySet,
            isLoading, sorting
        },
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 },
        columnVirtualizerOptions: { overscan: 2 },
        initialState: {
            rowSelection: mySet,
            density: 'compact',
            showGlobalFilter: true,
        },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={handleExportData}
                    startIcon={<FileDownloadIcon />}
                >
                    Export All Data
                </Button>
            </Box>
        )
    });

    return (
        <MaterialReactTable table={table} />
    )
};

export default EnrichmentM