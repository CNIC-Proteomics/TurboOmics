import { Box, Button } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { MetaboID } from '@/utils/MetaboID'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'


const MetaboliteCategoryTable = ({ mCat, idType, setShowLoading }) => {

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

    /*
    When component is mounted remove the loading pin
    */
    useEffect(() => {
        setShowLoading(false);
    },[setShowLoading]);

    return (
        <MaterialReactTable table={table} />
    )
};

export default MetaboliteCategoryTable