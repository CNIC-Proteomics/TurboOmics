import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

//MRT Imports
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_ShowHideColumnsButton } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';

//Material UI Imports
import {
    Box,
    Button,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { useJob } from '@/components/app/JobContext';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import { useResults } from '@/components/app/ResultsContext';

const MyMRTable = ({
    omic,
    sign,
    thr,
    fRef,
    myReRender,
    f2MeanL,
    setLoadingEnrichment
}) => {

    const f2i = useJob().user[`${omic}2i`];
    const factor = useResults().MOFA.displayOpts.selectedPlot.Factor;
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const myLoadings = useResults().MOFA.data.loadings[omic][factor];

    /*
    Get columns
    */
    const columns = useMemo(() => {
        let columns = [];
        columns = columns.concat(
            f2i.columns.map(f => ({
                header: f,
                accessorKey: f,
                muiTableHeadCellProps: {
                    align: 'left',
                },
                muiTableBodyCellProps: {
                    align: 'left',
                },
                //size= 100
            }))
        );

        if (mdataColInfo.type == 'categorical')
            columns.push(
                ...mdataColInfo.levels.map(l => ({
                    header: `Z̄(${l})`,
                    accessorKey: l,
                    muiTableHeadCellProps: {
                        align: 'left',
                    },
                    muiTableBodyCellProps: {
                        align: 'center',
                    },

                }))
            );

        columns.push({
            header: factor,
            accessorKey: factor,
            muiTableHeadCellProps: {
                align: 'left',
            },
            muiTableBodyCellProps: {
                align: 'center',
            },
            filterFn: sign == 'up' ? 'greaterThan' : 'lessThan'
        });

        return columns;
    }, [f2i, mdataColInfo, factor, sign]);

    /*
    Get data
    */
    const data = useMemo(() => {
        let f2iJson = danfo2RowColJson(f2i.fillNa(''));

        let data = {};

        Object.keys(myLoadings)./*filter(
            f => sign == 'up' ? myLoadings[f] > 0 : myLoadings[f] < 0
        ).*/map(
            f => {
                data[f] = {
                    ...f2iJson[f],
                    ...f2MeanL[f],
                    [factor]: Math.round(myLoadings[f] * 10000) / 10000
                }
            })

        data = Object.values(data);
        return data;
    }, [f2i, f2MeanL, factor, myLoadings]);


    /*
    Design MRT
    */

    const table = useMaterialReactTable({
        columns,
        data,
        layoutMode: 'grid',
        enableColumnResizing: true,
        enableSelectAll: false,
        enableColumnFilterModes: true,
        enableColumnFilters: true,
        enableColumnOrdering: true,
        enableGrouping: true,
        enableColumnPinning: true,
        enableFacetedValues: true,
        enableRowActions: false,
        enableRowSelection: false,
        enableDensityToggle: false,
        enableFullScreenToggle: true,
        enableGlobalFilter: false,
        initialState: {
            density: 'compact',
            showColumnFilters: true,
            showGlobalFilter: false,
            columnFilters: [{ id: factor, value: Math.round(thr * 10000) / 10000 }],
            sorting: [{ id: factor, desc: sign == 'up' ? true : false }]
        },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',

        muiPaginationProps: {
            //color: 'secondary',
            rowsPerPageOptions: [10],//, 20, 30],
            shape: 'rounded',
            variant: 'outlined',
        },

        renderTopToolbar: ({ table }) => (
            <MyRenderTopToolbar
                table={table}
                fRef={fRef}
                sign={sign}
                myReRender={myReRender}
                setLoadingEnrichment={setLoadingEnrichment}
            />
        ),
    })

    return (
        <Box sx={{ px: 5, pb: 3 }}>
            <MaterialReactTable table={table} />
        </Box>
    )
}

const MyRenderTopToolbar = ({ 
    table, 
    fRef, 
    sign, 
    myReRender, 
    setLoadingEnrichment 
}) => {
    const myFlatRows = table.getFilteredRowModel().flatRows;
    const myRows = myFlatRows.map(e => e.original);
    const myRowsID = myFlatRows.map(e => e.id);

    const [rows, setRows] = useState([]);
    const [rowsID, setRowsID] = useState([]);

    useEffect(() => {
        const myTimeOut2 = setTimeout(() => setLoadingEnrichment(true), 500);
        fRef.current[sign] = rows;
        const myTimeOut = setTimeout(() => { myReRender() }, 2500);
        return () => {clearTimeout(myTimeOut); clearTimeout(myTimeOut2)};
    }, [rows, fRef, sign, myReRender]);

    // if new elements, set them and reRender
    if (
        !myRowsID.map(i => rowsID.includes(i)).every(e => e) ||
        !rowsID.map(i => myRowsID.includes(i)).every(e => e)
    ) {
        setRowsID(myRowsID);
        setRows(myRows);
    }

    const handleExportRows = (rows) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `${omic}_${factor}_vs_${mdataCol}_filtered`
        });
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `${omic}_${factor}_vs_${mdataCol}`
        });
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '16px',
                padding: '8px',
                flexWrap: 'wrap',
            }}
        >
            <Box>
                <MRT_ShowHideColumnsButton table={table} />
            </Box>
            <Button
                //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
            >
                Export All Data
            </Button>
            <Button
                disabled={table.getFilteredRowModel().rows.length === 0}
                //export all rows, including from the next page, (still respects filtering and sorting)
                onClick={() =>
                    handleExportRows(table.getFilteredRowModel().rows)
                }
                startIcon={<FileDownloadIcon />}
            >
                Export Filtered Rows
            </Button>
        </Box>
    )
}

export default MyMRTable