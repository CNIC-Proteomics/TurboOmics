import { Box } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useVars } from '../../../VarsContext'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

function PathwayExplorer({ view, path_info, rId2info, workingOmics }) {

    // Import global variables
    const { OMIC2NAME } = useVars();

    return (
        <Box sx={{ border: '1px solid red' }}>
            {view == 'Single-View' &&
                <ViewComponent
                    path_info={path_info}
                    rId2info={rId2info}
                    view={view}
                />
            }
            {view == 'Multi-View' &&
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', border: '1px solid blue' }}>
                    {workingOmics.map(o => (
                        <Box key={o} sx={{ border: '1px solid red' }}>
                            <ViewComponent
                                path_info={Object.values(path_info[OMIC2NAME[o]])}
                                rId2info={rId2info}
                                view={view}
                            />
                        </Box>
                    ))}
                </Box>
            }
        </Box>
    )
}

const ViewComponent = ({ path_info, rId2info, view }) => {

    //console.log(path_info);
    //console.log(rId2info)

    const [pathwaySelection, setPathwaySelection] = useState({});

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: view == 'Single-View' ? 'row' : 'column',
            justifyContent: 'space-evenly'
        }}
        >
            <PathwayTable
                pathwaySelection={pathwaySelection}
                setPathwaySelection={setPathwaySelection}
                path_info={path_info}
            />
            <FeatureTable />
        </Box>
    )
}

const PathwayTable = ({ pathwaySelection, setPathwaySelection, path_info }) => {

    const path_info_filtered = useMemo(() => path_info.filter(e => e.VIP > 1), [path_info]);

    const columns = useMemo(() => ([
        {
            accessorKey: 'Path_ID',
            header: 'Path_ID'
        },
        {
            accessorKey: 'Name',
            header: 'Name'
        },
        {
            id: 'VIP',
            accessorFn: (row) => row.VIP.toFixed(4),
            //accessorKey: 'VIP',
            header: 'VIP'
        }
    ]), []);

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
        data: path_info_filtered,
        enableRowSelection: true,
        enableMultiRowSelection: false, //use radio buttons instead of checkboxes
        getRowId: (row) => row.Path_ID, //give each row a more useful id
        muiTableBodyRowProps: ({ row }) => ({
            //add onClick to row to select upon clicking anywhere in the row
            onClick: row.getToggleSelectedHandler(),
            sx: { cursor: 'pointer' },
        }),
        enableStickyHeader: true,
        enablePagination: false,
        muiTableContainerProps: { sx: { maxHeight: '600px' } },
        enableBottomToolbar: false,
        enableTopToolbar: false,
        //positionToolbarAlertBanner: 'bottom', //move the alert banner to the bottom
        onRowSelectionChange: setPathwaySelection, //connect internal row selection state to your own
        state: { rowSelection: pathwaySelection, isLoading, sorting }, //pass our managed row selection state to the table to use
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 },
        onSortingChange: setSorting,
        enableRowVirtualization: true,
        state: {
            sorting: [{id: 'VIP', desc: true}]
        }
    })

    return (
        <Box>
            <MaterialReactTable table={table} />
        </Box>
    )
}

const FeatureTable = () => {
    return (
        <Box>
            Feature Table
        </Box>
    )
}

export default PathwayExplorer