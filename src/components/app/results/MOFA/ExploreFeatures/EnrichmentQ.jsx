import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GProfiler from './GProfiler'
import GSEA from './GSEA'
import { useResults } from '@/components/app/ResultsContext';
import { useJob } from '@/components/app/JobContext';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { GPTarget } from '@/utils/GPTarget';
import FieldSelector from './FieldSelector';


function EnrichmentQ({
    omic,
    fRef,
    f2MeanL,
    setQ2cat,
    colFid,
    setColFid
}) {

    const { OS } = useJob();
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];

    // Category enrichment
    const [category, setCategory] = useState(null); // Selected category
    const [qCat, setQCat] = useState(null); // Proteins of the selected category
    const [loadingPCTable, setLoadingPCTable] = useState(true);

    // Selection of column containing protein/transcript ID
    const f2i = useJob().user[`${omic}2i`];
    const f2iColumns = useMemo(
        () => f2i.columns.map(col => ({ label: col, id: col })),
        [f2i]
    );
    //const [colFid, setColFid] = useState(f2iColumns[0]);

    // Selection of column indicating ID type
    const GPTargetOptions = useMemo(
        () => GPTarget.map(e => ({ id: e, label: e })), []
    );
    const [typeID, setTypeID] = useState(omic == 'q' ? GPTargetOptions[97] : GPTargetOptions[42]);

    // Fetch all proteins of selected category
    const fetchProteins = useCallback(async () => {
        setLoadingPCTable(true);
        const res = await fetch(
            'https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "organism": OS.id,
                    "query": category.native,
                    "target": typeID.id
                })
            }
        );

        const resJson = await res.json();

        // All proteins of the experiment
        const myQ = [...new Set(f2i.column(colFid.id).values)];

        let myQCat = resJson.result.filter(
            e => myQ.includes(e.converted)
        ); // Get proteins category that are in the experiment

        myQCat = myQCat.filter(
            (json, index, self) => index === self.findIndex((t) => t.converted === json.converted)
        ); //drop duplicates

        setQCat(myQCat);

        setTimeout(() => setLoadingPCTable(false), 500);
    }, [category, OS, colFid.id, f2i, typeID]);

    useEffect(() => {
        if (category == null) {
            setQCat(null);
        } else {
            const myTimeOut = setTimeout(fetchProteins, 100);
            return () => clearTimeout(myTimeOut);
        }
    }, [category, fetchProteins]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <FieldSelector
                    options={f2iColumns}
                    selectedField={colFid}
                    setSelectedField={setColFid}
                >
                    Select Column Containing ID
                </FieldSelector>
                <Box sx={{ width: 10 }} />
                <FieldSelector
                    options={GPTargetOptions}
                    selectedField={typeID}
                    setSelectedField={setTypeID}
                >
                    Select ID Format
                </FieldSelector>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ width: "45%", mt: 3 }}>
                    <GProfiler
                        omic={omic}
                        fRef={fRef}
                        setCategory={setCategory}
                        colFid={colFid}
                        setQ2cat={setQ2cat}
                    />
                </Box>
                <Box sx={{ width: '45%' }}>
                    {
                        mdataColInfo.type == 'categorical' &&
                        mdataColInfo.levels.length > 1 &&
                        qCat &&
                        <Box sx={{ pl: 2, mt: 13 }}>
                            <Box sx={{ opacity: loadingPCTable ? 0 : 1, transition: 'all ease 0.2s' }}>
                                <ProteinCategoryTable
                                    qCat={qCat}
                                    fRef={fRef}
                                    omic={omic}
                                    colFid={colFid}
                                />
                            </Box>
                        </Box>
                    }
                </Box>
            </Box>
        </Box>
    )
}

const ProteinCategoryTable = ({ qCat, fRef, omic, colFid }) => {

    const idCol = colFid.id; // useJob().user.q2i.columns[0];

    const mySet = useMemo(() => {
        const mySet = {};
        fRef.map(e => { mySet[e[idCol]] = true });
        return mySet
    }, [fRef, idCol]);

    const myData = useMemo(() => {
        const mySetArr = Object.keys(mySet);
        let data = [];
        data = qCat.map(
            e => ({
                ...e,
                desc: e.description.replace(/\[[^\]]*\]/g, ''),
                filtered: mySetArr.includes(e.converted) ? 1 : 0
            })
        );

        data.sort((a, b) => (b.filtered - a.filtered));
        return data
    }, [qCat, mySet]);

    const columns = useMemo(() => ([
        {
            header: 'ID',
            accessorKey: 'converted',
            size: 60
        },
        {
            header: 'GN',
            accessorKey: 'name',
            size: 60
        },
        {
            header: 'Description',
            accessorKey: 'desc'
        },
        /*{
            header: 'Filtered',
            accessorKey: 'filtered'
        }*/
    ]), []);

    const handleExportData = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `CategoryProteins`
        });

        const data = myData.map(e => ({
            'ID': e.converted,
            'GN': e.name,
            'Description': e.desc,
            'Filtered': e.filtered
        }));

        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    const rowVirtualizerInstanceRef = useRef(null);
    //const [data, setData] = useState([]);
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
        muiTableContainerProps: { sx: { maxHeight: '300px' } },
        enableRowVirtualization: true,
        enableColumnVirtualization: true,
        getRowId: (row) => row.converted,
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

export default EnrichmentQ