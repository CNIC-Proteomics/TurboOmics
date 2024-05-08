import { Box, Button } from '@mui/material'
import React, { useMemo, useState } from 'react'

import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';

import { download, generateCsv, mkConfig } from 'export-to-csv';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { COLUMNS } from './utils/enrichmentColumns';

function EnrichmentTable({ gseaRes, omic, db }) {

    const isM = omic == 'm';

    const columns = useMemo(() => COLUMNS[isM ? 'm' : 't']);
    const myData = useMemo(() => {
        if (!isM) {
            return gseaRes.map(e => ({
                ...e,
                pval: e.pval == 0 ? 1 / 10000 : e.pval,
                nLeadingEdge: e.leadingEdge.length,
                leadingEdge: e.leadingEdge.reduce((prev, curr) => `${prev} // ${curr}`,)
            }))
        } else {
            return gseaRes.filter(e => !(e.overlap_size==0 || e.pathway_size==0));
        }
    }, [gseaRes]);

    const myDataStyle = useMemo(() => {
        if (!isM) {
            return myData.map(e => ({
                ...e,
                pval: e.pval == 0 ? 0 : Number.parseFloat(e.pval).toExponential(2),
                padj: Number.parseFloat(e.padj).toExponential(2),
                ES: Number.parseFloat(e.ES),//.toExponential(2),
                NES: Number.parseFloat(e.NES)//.toExponential(2)
            }));
        } else {
            return myData.map(e => ({
                ...e,
                'p-value': Number.parseFloat(e['p-value']).toExponential(2)
            }));
        }
    }, [myData]);

    console.log(myData);
    console.log(columns);

    const [rowSelection, setRowSelection] = useState({});


    const table = useMaterialReactTable({
        columns: columns,
        data: myDataStyle, //10,000 rows
        //defaultDisplayColumn: { enableResizing: true },
        //layoutMode: 'grid',
        enableStickyHeader: true,
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
        enableMultiRowSelection: true,
        enableDensityToggle: false,
        enableColumnFilters: true,
        enableColumnFilterModes: true,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnActions: false,
        muiTableContainerProps: { sx: { maxHeight: '400px' } },
        //onSortingChange: setSorting,
        enableFacetedValues: true,
        initialState: {
            density: 'compact',
            showGlobalFilter: true,
            showColumnFilters: true,
            //columnFilters: [{ id: 'FDR', value: 0.1 }],
            //rowSelection: { initialSelectedRow }
        },
        positionToolbarAlertBanner: 'bottom', //move the alert banner to the bottom
        getRowId: (row) => row.native, //give each row a more useful id
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
                    onClick={() => handleExportData(myData, db)}
                    startIcon={<FileDownloadIcon />}
                >
                    Export All Data
                </Button>
            </Box>
        )
    });

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box sx={{ width: 1050, border: '0px solid red' }}>
                <MaterialReactTable table={table} />
            </Box>
        </Box>
    )
}

const handleExportData = (data, db) => {
    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: `GSEA_Enrichment_${db}`
    });

    /*const data = myData.map(e => ({
        'GO': e.native,
        'Type': e.source,
        'Name': e.name,
        'FDR': e.FDR
    }));*/

    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
};

export default EnrichmentTable