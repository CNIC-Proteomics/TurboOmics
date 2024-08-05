import { Box } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import React, { useMemo } from 'react'

function ModelInfo({ model_info }) {

    console.log(model_info)
    
    const columns = useMemo(() => ([
        {
            //accessorFn: (row) => `${row.LV + 1}`,
            accessorKey: 'LV',
            header: 'Latent Variable',
        }
    ]), []);

    const table = useMaterialReactTable({
        columns:columns,
        data:model_info.LV, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableColumnFilterModes: false,
        enableColumnOrdering: false,
        enableGrouping: false,
        enableColumnPinning: false,
        enableFacetedValues: false,
        enableRowActions: false,
        enableRowSelection: false,
        enableGlobalFilter: false,
        enableColumnActions: false,
        enableSorting: false,
        enableDensityToggle: false,
        enableHiding: false,
        enableFullScreenToggle: false,
        enableFilters: false,
        enableBottomToolbar:false
    })

    return (
        <Box>
            <MaterialReactTable table={table} />
        </Box>
    )
}

export default ModelInfo