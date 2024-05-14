import useFx2i from '@/hooks/useFx2i';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import React, { use, useCallback, useMemo, useState } from 'react'
import { Box, Button, Dialog } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShowChartIcon from '@mui/icons-material/ShowChart';

//MRT Imports
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_ShowHideColumnsButton } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import CustomGSEA from './CustomGSEA';


function CustomEnrichment({ gseaData, omic }) {

    // Create fid2rank
    const fid2rank = useMemo(() => {
        const fid2rank = {};
        Object.keys(gseaData).map(e => {
            gseaData[e].f.map(f => {
                fid2rank[f] = gseaData[e].rank;
            });
        });
        return fid2rank;
    }, [gseaData]);

    // Get fx2i table and table data
    const [fx2i] = useFx2i(omic);
    const [myData, gseaDataPlot] = useMemo(() => {
        const fx2iJson = danfo2RowColJson(fx2i);
        const myData = Object.keys(fx2iJson).map(e => {
            const record = {
                ...fx2iJson[e],
                rank: Number.parseFloat(Number.parseFloat(fid2rank[e]).toExponential(5))
            };
            return record;
        });

        const gseaDataPlot = {}
        myData.map(e => gseaDataPlot[e[fx2i.columns[0]]] = e['rank'])

        return [myData, gseaDataPlot];
    }, [fx2i, fid2rank]);

    // Generate columns
    const columns = useMemo(() => {

        const regexFilterFn = (row, id, filterValue) => {
            let re;
            try {
                re = new RegExp(filterValue);
            } catch {
                return true
            }
            return re.test(row.getValue(id))
        }

        let columns = fx2i.columns.map((e, i) => ({
            header: e,
            accessorKey: e,
            muiTableHeadCellProps: {
                align: 'left',
            },
            muiTableBodyCellProps: {
                align: 'left',
            },
            filterFn: fx2i.ctypes.values[i] == 'string' ? regexFilterFn : 'equals',
            columnFilterModeOptions: fx2i.ctypes.values[i] == 'string' ? [] : null,
            ...fx2i.ctypes.values[i] == 'string' ? { muiFilterTextFieldProps: { placeholder: 'Regex' } } : {},
        }));

        columns = [
            ...columns,
            {
                header: 'Ranking Metric',
                accessorKey: 'rank',
                muiTableHeadCellProps: {
                    align: 'left',
                },
                muiTableBodyCellProps: {
                    align: 'center',
                },
                filterFn: 'greaterThan'
            }
        ];

        return columns;
    }, [fx2i]);

    /*
    GSEA Plot control
    */
    const [plotGsea, setPlotGsea] = useState(false);
    const setPlotGseaFn = useCallback(() => setPlotGsea(true), []);

    /*
    Design MRT
    */

    const table = useMaterialReactTable({
        columns,
        data: myData,
        layoutMode: 'grid',
        enableColumnResizing: true,
        enableColumnActions: false,
        enableSelectAll: false,
        enableColumnFilterModes: true,
        enableColumnFilters: true,
        enableColumnOrdering: true,
        enableColumnDragging: false,
        enableGrouping: true,
        enableColumnPinning: true,
        enableFacetedValues: true,
        enableRowActions: false,
        enableRowSelection: false,
        enableDensityToggle: false,
        enableFullScreenToggle: true,
        enableGlobalFilter: false,
        enableFilterMatchHighlighting: false,
        muiTableContainerProps: { sx: { maxHeight: '500px' } },
        initialState: {
            density: 'compact',
            showColumnFilters: true,
            showGlobalFilter: false,
            sorting: [{ id: 'rank', desc: true }]
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
                myData={myData}
                setPlotGseaFn={setPlotGseaFn}
            />
        )
    });

    const filteredSet = table.getFilteredRowModel().rows.map((row) => row.original[fx2i.columns[0]]);

    return (
        <Box sx={{ px: 5, pb: 3, mt:2 }}>
            <MaterialReactTable table={table} />
            <Dialog
                onClose={() => setPlotGsea(false)}
                open={plotGsea}
                maxWidth='md'
                fullWidth={true}
            >
                <Box sx={{p:4}}>
                    <CustomGSEA
                        f2MeanL={gseaDataPlot}
                        fSet={filteredSet}
                    />
                </Box>
            </Dialog>
        </Box>
    )
}

const MyRenderTopToolbar = ({ table, myData, setPlotGseaFn }) => {

    const handleExportRows = (table, myData) => {

        //console.log(table.getFilteredRowModel().rows)
        let rowData = table.getFilteredRowModel().rows.map((row) => row.original);
        console.log(rowData);
        console.log(myData)

        const key = Object.keys(myData[0])[0];
        const filteredKeys = rowData.map(e => e[key]);
        const exportData = myData.map(e => ({ ...e, CustomSet: filteredKeys.includes(e[key]) }));

        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: 'Enrichment_Table'//`${omic}_${factor}_vs_${mdataCol}_filtered`
        });
        const csv = generateCsv(csvConfig)(exportData).replace(/,null/g, ',').replace(/^null,/g, ',');
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
                //disabled={table.getFilteredRowModel().rows.length === 0}
                //export all rows, including from the next page, (still respects filtering and sorting)
                onClick={() =>
                    handleExportRows(table, myData)
                }
                startIcon={<FileDownloadIcon />}
            >
                Export Table
            </Button>
            <Button
                disabled={table.getFilteredRowModel().rows.length === myData.length}
                onClick={() =>
                    setPlotGseaFn()
                }
                startIcon={<ShowChartIcon />}
            >
                Plot GSEA
            </Button>
        </Box>
    )
}

export default CustomEnrichment