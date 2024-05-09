import useFx2i from '@/hooks/useFx2i';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import React, { useMemo } from 'react'

//MRT Imports
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_ShowHideColumnsButton } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { Box } from '@mui/material';


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
    const myData = useMemo(() => {
        const fx2iJson = danfo2RowColJson(fx2i);
        const myData = Object.keys(fx2iJson).map(e => {
            const record = {
                ...fx2iJson[e],
                rank: Number.parseFloat(fid2rank[e]).toExponential(4)
            };
            return record;
        })
        return myData;
    }, [fx2i]);

    // Generate columns
    const columns = useMemo(() => {
        let columns = fx2i.columns.map(e => ({
            header: e,
            accessorKey: e,
            muiTableHeadCellProps: {
                align: 'left',
            },
            muiTableBodyCellProps: {
                align: 'left',
            },
            filterFn: 'contains'
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
                filterFn: 'contains'
            }
        ];

        return columns;
    }, [fx2i]);

    /*
    Design MRT
    */

    const table = useMaterialReactTable({
        columns,
        data: myData,
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
            //columnFilters: [{ id: factor, value: Math.round(thr * 10000) / 10000 }],
            //sorting: [{ id: factor, desc: sign == 'up' ? true : false }]
        },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',

        muiPaginationProps: {
            //color: 'secondary',
            rowsPerPageOptions: [10],//, 20, 30],
            shape: 'rounded',
            variant: 'outlined',
        },

        /*renderTopToolbar: ({ table }) => (
            <MyRenderTopToolbar
                table={table}
                q2cat={q2cat}
                colFid={colFid}
            />
        ),*/
    });

    return (
        <Box sx={{ px: 5, pb: 3 }}>
            <MaterialReactTable table={table} />
        </Box>
    )
}

export default CustomEnrichment