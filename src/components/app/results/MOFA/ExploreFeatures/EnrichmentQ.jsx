import { Box, Button } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import GProfiler from './GProfiler'
import GSEA from './GSEA'
import { useResults } from '@/components/app/ResultsContext';
import { useJob } from '@/components/app/JobContext';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';

function EnrichmentQ({ fRef, f2MeanL }) {

    const { OS } = useJob()
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const [category, setCategory] = useState(null);
    const [qCat, setQCat] = useState(null);

    const fetchProteins = useCallback(async () => {
        const res = await fetch(
            'https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "organism": OS.id,
                    "query": category.native,
                    "target": "UNIPROT_GN_ACC"
                })
            }
        );

        const myQ = Object.keys(f2MeanL);
        const resJson = await res.json();
        const qCat = resJson.result.filter(
            e => myQ.includes(e.converted)
        );
        setQCat(qCat);
    }, [category, OS, f2MeanL]);

    useEffect(() => {
        if (category == null) return;
        const myTimeOut = setTimeout(fetchProteins, 100);
        return () => clearTimeout(myTimeOut);
    }, [category, fetchProteins]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ width: '45%' }}>
                <GProfiler fRef={fRef} setCategory={setCategory} />
            </Box>
            <Box sx={{ width: '45%' }}>
                {mdataColInfo.type == 'categorical' && mdataColInfo.levels.length > 1 && qCat && <>
                    <GSEA
                        f2MeanL={f2MeanL}
                        fSet={qCat.map(e => e.converted)}
                    />
                    <Box sx={{ pl: 2, mt: 1 }}>
                        <ProteinCategoryTable qCat={qCat} fRef={fRef} />
                    </Box>
                </>}
            </Box>
        </Box>
    )
}

const ProteinCategoryTable = ({ qCat, fRef }) => {

    const idCol = useJob().user.q2i.columns[0];

    const mySet = useMemo(() => {
        const mySet = {};
        fRef.map(e => { mySet[e[idCol]] = true });
        return mySet
    }, [fRef])

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
        muiTableContainerProps: { sx: { maxHeight: '240px' } },
        //enableRowSelection: (row) => row.original.age >= 21,
        getRowId: (row) => row.converted,
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

    return <MaterialReactTable table={table} />;
};

export default EnrichmentQ