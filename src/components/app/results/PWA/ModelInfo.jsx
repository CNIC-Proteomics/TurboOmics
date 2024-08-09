import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVars } from '../../../VarsContext';
import handleExportData from '../../../../utils/exportDataTable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useJob } from '../../JobContext';
import { calculateBackgroundColor, calculateBackgroundColorRed } from '../../../../utils/numberToColor';

const generealProps = {
    muiTableHeadCellProps: {
        align: 'center',
    },
    muiTableBodyCellProps: {
        align: 'center',
    },
    size: 150
}

function ModelInfo({ runId, model_info, view, workingOmics }) {

    // Improt global var
    const { OMIC2NAME, API_URL } = useVars();

    // Get job var
    const { jobID } = useJob();

    // Get model pvalue
    const [statsModel, setStatsModel] = useState({ status: 'ready' });
    const getStatsIntervalRef = useRef();

    const fetchStatsModel = useCallback(async (runId) => {
        console.log('fetching stats model');
        const res = await fetch(`${API_URL}/get_stats_model/${jobID}/${view}/${runId}`);
        const resJson = await res.json();
        console.log(resJson)
        if (resJson.status != 'waiting') {
            setStatsModel(resJson);
            clearInterval(getStatsIntervalRef.current);
        }
    }, [API_URL, jobID, view, getStatsIntervalRef]);

    useEffect(() => {
        console.log('useEffect');
        if (statsModel.status != 'ready') return;
        const myInterval = setInterval(() => fetchStatsModel(runId), 5000);
        getStatsIntervalRef.current = myInterval;
        return () => clearInterval(myInterval);
    }, [fetchStatsModel, getStatsIntervalRef, statsModel, runId]);


    // Percentage per each omic in Multi-View case
    const mvColumns = useMemo(() => {
        let mv = [];
        if (view == 'Multi-View') {
            mv = workingOmics.map(e => ({
                header: `${OMIC2NAME[e]} (%)`,
                id: e,
                accessorFn: (row) => (row.omic_weight[OMIC2NAME[e]] * 100).toFixed(2),
                ...generealProps,
                Cell: ({ renderedCellValue, row }) => (
                    <Box sx={{
                        backgroundColor: calculateBackgroundColorRed(renderedCellValue, 0, 100),
                        border: '0px solid red',
                        py: 1,
                    }}
                    >
                        {renderedCellValue}
                    </Box>
                )
            }));
        }
        return mv;
    }, [workingOmics, OMIC2NAME, view]);

    const columns = useMemo(() => ([
        {
            accessorKey: 'LV',
            header: 'Latent Variable',
            ...generealProps
        },
        ...mvColumns,
        {
            id: 'R2',
            header: 'R2',
            accessorFn: (row) => `${Math.round(row.R2 * (10 ** 4)) / (10 ** 4)}`,
            ...generealProps,
            Cell: ({ renderedCellValue, row }) => (
                <Box sx={{
                    backgroundColor: calculateBackgroundColorRed(renderedCellValue, 0, 1),
                    py: 1,
                }}
                >
                    {renderedCellValue}
                </Box>
            )
        },
        {
            //accessorKey: 'R2',
            id: 'pv',
            header: 'p-value',
            accessorFn: (row) => `${row.pv < 0.0001 ? row.pv.toExponential(2) : row.pv.toFixed(5)}`,
            ...generealProps,
            Cell: ({ renderedCellValue, row }) => (
                <Box sx={{
                    backgroundColor: calculateBackgroundColor(renderedCellValue),
                    py: 1,
                }}
                >
                    {renderedCellValue}
                </Box>
            )
        }
    ]), [mvColumns]);

    const table = useMaterialReactTable({
        columns: columns,
        data: model_info.LV, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        //initialState: { density: 'compact' },
        muiTableBodyCellProps: {
            sx: {
                p: 0,
                //borderRight: '2px solid #e0e0e0', //add a border between columns
            }
        },
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
        enableBottomToolbar: false,
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box>
                    <Button
                        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                        onClick={() => handleExportData(
                            table.getRowModel().rows.map(e => e._valuesCache),
                            table.getAllColumns().map(
                                e => ({ key: e.columnDef.id, displayLabel: e.columnDef.header })
                            ),
                            'PathwayAnalysis_Model',
                        )}
                        startIcon={<FileDownloadIcon />}
                    >
                        Export Table
                    </Button>
                </Box>
                <Box><Typography variant='h6'>Summary statistics</Typography></Box>
                <Box sx={{ border: '0px solid red', textAlign: 'center' }}>
                    <Box sx={{
                        backgroundColor: calculateBackgroundColorRed(model_info.model.R2, 0, 1, 0.1),
                        borderRadius: 2, px: 2
                    }}>
                        <Typography variant='body1'>
                            Model R2 = {model_info.model.R2.toFixed(4)}
                        </Typography>
                    </Box>
                    <Box sx={{
                        backgroundColor: statsModel.status == 'ok' ?
                            statsModel.statsModel.R2pv <= 0.1 ? 'rgba(0,200,0,0.1)' : 'white' :
                            'white',
                        borderRadius: 2, transition: 'all 1s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1
                    }}>
                        <Typography variant='body1'>p-value {'≤'} </Typography>
                        <Box sx={{ pl: 0.75 }}>
                            {['ready', 'waiting'].includes(statsModel.status) &&
                                <Box sx={{ pt: 0.5 }}><CircularProgress size={15} disableShrink={true} /></Box>}
                            {statsModel.status == 'ok' &&
                                <Typography variant='body1'>{statsModel.statsModel.R2pv}</Typography>}
                        </Box>
                    </Box>
                </Box>
            </Box>
        )
    })


    return (
        <Box>
            <MaterialReactTable table={table} />
        </Box>
    )
}

export default ModelInfo