import { Box, Button } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { download, generateCsv, mkConfig } from 'export-to-csv'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

function CategoryTable ({ myData, setCategory, myUsrFilt, setMyUsrFilt }) {
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

export default CategoryTable;