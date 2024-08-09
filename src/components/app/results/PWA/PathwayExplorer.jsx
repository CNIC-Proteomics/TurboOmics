import { Box, Button, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useVars } from '../../../VarsContext'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import handleExportData from '../../../../utils/exportDataTable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { calculateBackgroundColorBlueRed, calculateBackgroundColorRed } from '../../../../utils/numberToColor';

function PathwayExplorer({ view, path_info, rId2info, workingOmics }) {

    // Import global variables
    const { OMIC2NAME } = useVars();

    return (
        <Box sx={{ mt: 2 }}>
            {view == 'Single-View' &&
                <ViewComponent
                    path_info={path_info}
                    rId2info={rId2info}
                    view={view}
                />
            }
            {view == 'Multi-View' &&
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-evenly' }}>
                    {workingOmics.map(o => (
                        <Box key={o} sx={{ px: 2, width: `${Math.max(100 / workingOmics.length, 50)}%` }}>
                            <ViewComponent
                                path_info={Object.values(path_info[OMIC2NAME[o]])}
                                rId2info={rId2info}
                                view={view}
                                omic={o}
                            />
                        </Box>
                    ))}
                </Box>
            }
        </Box>
    )
}

const ViewComponent = ({ path_info, rId2info, view, omic }) => {

    const [pathwaySelection, setPathwaySelection] = useState({});

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: view == 'Single-View' ? 'row' : 'column',
            justifyContent: 'space-evenly'
        }}
        >
            <Box sx={{ width: view == 'Single-View' ? '45%' : '98%' }}>
                <PathwayTable
                    pathwaySelection={pathwaySelection}
                    setPathwaySelection={setPathwaySelection}
                    path_info={path_info}
                    omic={omic}
                />
            </Box>
            <Box sx={{
                width: view == 'Single-View' ? '45%' : '98%',
                display: 'flex',
                alignItems: 'center',
                mt: view == 'Multi-View' ? 2 : 0
            }}
            >
                {Object.keys(pathwaySelection).length > 0 &&
                    <Box sx={{ width: '100%' }}>
                        <FeatureTable
                            pathway={Object.keys(pathwaySelection)}
                            path_info={path_info}
                            rId2info={rId2info}
                            view={view}
                        />
                    </Box>
                }
                {Object.keys(pathwaySelection).length == 0 &&
                    <Box
                        sx={{
                            border: '2px dashed grey', // Línea discontinua, gruesa y de color gris
                            borderRadius: '16px', // Borde redondeado
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            //height: '100%', // Ajusta la altura según lo necesites
                            width: '100%', // Puedes ajustar el ancho también
                            textAlign: 'center',
                            padding: '16px',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Typography variant='body1'>Click pathway to show biomolecules</Typography>
                    </Box>
                }
            </Box>
        </Box>
    )
}

const PathwayTable = ({ pathwaySelection, setPathwaySelection, path_info, omic }) => {

    const { OMIC2NAME } = useVars();
    const path_info_filtered = useMemo(
        () => path_info.filter(e => e.VIP > 1).map(e => ({ ...e, N: e.molecular_importance.length })),
        [path_info]
    );

    const maxVIP = useMemo(() => {
        let maxVIP = 0;
        path_info_filtered.map(e => {
            if(e.VIP > maxVIP) maxVIP = e.VIP;
        });
        return maxVIP
    }, path_info_filtered);

    const columns = useMemo(() => ([
        {
            accessorKey: 'Path_ID',
            header: 'Path_ID',
            size: 100
        },
        {
            accessorKey: 'Name',
            header: 'Name',
        },
        {
            accessorKey: 'N',
            header: 'N.',
            size: 50,
            muiTableBodyCellProps:{align:'center'},
        },
        {
            id: 'VIP',
            accessorFn: (row) => row.VIP.toFixed(4),
            //accessorKey: 'VIP',
            header: 'VIP',
            size: 60,
            muiTableBodyCellProps:{align:'center'},
            Cell: ({ renderedCellValue, row }) => (
                <Box sx={{
                    backgroundColor: calculateBackgroundColorRed(renderedCellValue, 1, maxVIP),
                    py: 1.5, width:'100%', height:'100%'
                }}
                >
                    {renderedCellValue}
                </Box>
            )
        }
    ]), []);


    // Virtualization
    const rowVirtualizerInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState([{ id: 'VIP', desc: true }]);

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
        layoutMode: 'grid',
        enableRowSelection: true,
        enableMultiRowSelection: false, //use radio buttons instead of checkboxes
        getRowId: (row) => row.Path_ID, //give each row a more useful id
        muiTableBodyRowProps: ({ row }) => ({
            //add onClick to row to select upon clicking anywhere in the row
            onClick: row.getToggleSelectedHandler(),
            sx: { cursor: 'pointer' },
        }),
        muiTableBodyCellProps: {sx: {p: 0,}},
        enableStickyHeader: true,
        enablePagination: false,
        muiTableContainerProps: { sx: { maxHeight: '400px' } },
        enableBottomToolbar: false,
        enableTopToolbar: true,
        //positionToolbarAlertBanner: 'bottom', //move the alert banner to the bottom
        onRowSelectionChange: setPathwaySelection, //connect internal row selection state to your own
        state: {
            rowSelection: pathwaySelection,
            sorting,
            isLoading
        }, //pass our managed row selection state to the table to use
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 },
        onSortingChange: setSorting,
        enableRowVirtualization: true,
        enableDensityToggle: false,
        enableHiding: false,
        enableFullScreenToggle: false,
        enableFilters: false,
        positionToolbarAlertBanner: 'none',
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ width: '33%' }}><Button
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={() => handleExportData(
                        path_info_filtered,//table.getRowModel().rows.map(e => e._valuesCache),
                        table.getAllColumns().map(
                            e => ({ key: e.columnDef.id, displayLabel: e.columnDef.header })
                        ).filter(e => e.displayLabel != 'Select'),
                        'PathwayImportance',
                    )}
                    startIcon={<FileDownloadIcon />}
                >
                    Export Table
                </Button></Box>
                {omic && <Box sx={{ width: '33%', textAlign: 'center' }}>
                    <Typography variant='h6'>{OMIC2NAME[omic]}</Typography>
                </Box>}
                <Box sx={{ width: '33%' }}></Box>
            </Box>
        )
    })

    return (
        <Box>
            <MaterialReactTable table={table} />
        </Box>
    )
}

const FeatureTable = ({
    pathway,
    path_info,
    rId2info,
    view
}) => {

    const { OMIC2NAME } = useVars();

    const [pathwayInfo, featureInfo] = useMemo(() => {
        const pathwayInfo = path_info.filter(e => e.Path_ID == pathway)[0];
        const featureInfo = pathwayInfo.molecular_importance.map(e => ({
            ...e,
            ...rId2info[e.omic][e.fid]
        })).map(e => ({
            ...e,
            Name: (e.omic == 'q' || e.omic == 't') ?
                `${e.name} | ${e.description.replace(/\[.*\]$/, '')}` : e.Name,
            omicName: OMIC2NAME[e.omic],
        }))
        return [pathwayInfo, featureInfo];
    }, [pathway]);

    const maxLoading = useMemo(() => {
        let maxLoading = 0;
        featureInfo.map( e => {
            if (Math.abs(e.PC1_Loadings) > maxLoading) {
                maxLoading = Math.abs(e.PC1_Loadings);
            }
        });
        return maxLoading;
    }, []);

    const columns = useMemo(() => {
        const colOmic = view == 'Single-View' ? [{
            header: 'Omic',
            accessorKey: 'omicName',
            size: 100
        }] : [];
        return [
            {
                header: '#',
                accessorKey: 'xId',
                size: 100,
                muiTableBodyCellProps: {sx: {px: 2, py:0}},
            },
            ...colOmic,
            {
                header: 'ID',
                accessorKey: 'uId',
                size: 100,
            },
            {
                header: 'Name',
                accessorKey: 'Name'
            },
            {
                header: 'Loading',
                id: 'PC1_Loadings',
                accessorFn: (row) => Number(row.PC1_Loadings.toFixed(4)),
                size: 120,
                muiTableBodyCellProps: {
                    align: 'center',
                },
                Cell: ({ renderedCellValue, row }) => (
                    <Box sx={{
                        backgroundColor: calculateBackgroundColorBlueRed(renderedCellValue, -maxLoading, maxLoading),
                        py: 1.5, width:'100%', height:'100%'
                    }}
                    >
                        {renderedCellValue}
                    </Box>
                )
            }
        ]
    }, [view]);

    // Virtualization
    const rowVirtualizerInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState([{ id: 'PC1_Loadings', desc: true }]);

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
        columns: columns,
        data: featureInfo,
        enableStickyHeader: true,
        enablePagination: false,
        muiTableContainerProps: { sx: { maxHeight: '400px', minHeight: '400px' } },
        enableBottomToolbar: false,
        enableTopToolbar: true,
        enableSorting: true,
        initialState: {
        },
        state: {
            sorting,
            isLoading
        }, //pass our managed row selection state to the table to use
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 },
        onSortingChange: setSorting,
        enableRowVirtualization: true,
        enableDensityToggle: false,
        enableHiding: false,
        enableFullScreenToggle: false,
        enableFilters: false,
        muiTableBodyCellProps: {sx: {px: 0, py:0}},
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                <Box>
                    <Button
                        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                        onClick={() => handleExportData(
                            featureInfo,
                            table.getAllColumns().map(
                                e => ({ key: e.columnDef.id, displayLabel: e.columnDef.header })
                            ),
                            'Biomolecules',
                        )}
                        startIcon={<FileDownloadIcon />}
                    >
                        Export Table
                    </Button>
                </Box>
                <Box><Typography variant='body1'>{pathwayInfo.Name}</Typography></Box>
                <Box><Typography variant='body1'>{pathway}</Typography></Box>
            </Box>
        )
    })


    return (
        <Box>
            <MaterialReactTable table={table} />
        </Box>
    )
}

export default PathwayExplorer