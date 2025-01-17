import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVars } from '../../../VarsContext'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import handleExportData from '../../../../utils/exportDataTable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { calculateBackgroundColorBlueRed, calculateBackgroundColorRed } from '../../../../utils/numberToColor';
import GradientIcon from '@mui/icons-material/Gradient';
import { useJob } from '../../JobContext';
import { useResults } from '../../ResultsContext';

import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter'
import { HeatMapCanvas, ResponsiveHeatMapCanvas } from '@nivo/heatmap';

import { DownloadHeatmap } from "@/utils/DownloadRechartComponent";

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
                        <Box key={o} sx={{ px: 2, width: `${Math.min(100 / workingOmics.length, 50)}%` }}>
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
                            pathway={Object.keys(pathwaySelection)[0]}
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
            if (e.VIP > maxVIP) maxVIP = e.VIP;
        });
        return maxVIP
    }, [path_info_filtered]);

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
            muiTableBodyCellProps: { align: 'center' },
        },
        {
            id: 'VIP',
            accessorFn: (row) => row.VIP.toFixed(4),
            //accessorKey: 'VIP',
            header: 'VIP',
            size: 60,
            muiTableBodyCellProps: { align: 'center' },
            Cell: ({ renderedCellValue, row }) => (
                <Box sx={{
                    backgroundColor: calculateBackgroundColorRed(renderedCellValue, 1, maxVIP),
                    py: 1.5, width: '100%', height: '100%'
                }}
                >
                    {renderedCellValue}
                </Box>
            )
        }
    ]), [maxVIP]);


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
        muiTableBodyCellProps: { sx: { p: 0, } },
        enableStickyHeader: true,
        enablePagination: false,
        muiTableContainerProps: { sx: { minHeight: '400px', maxHeight: '400px' } },
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
        enableFilters: true,
        enableGlobalFilter: false,
        initialState: { showColumnFilters: true },
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
        }));
        return [pathwayInfo, featureInfo];
    }, [pathway, OMIC2NAME, path_info, rId2info]);

    const maxLoading = useMemo(() => {
        let maxLoading = 0;
        featureInfo.map(e => {
            if (Math.abs(e.PC1_Loadings) > maxLoading) {
                maxLoading = Math.abs(e.PC1_Loadings);
            }
        });
        return maxLoading;
    }, [featureInfo]);

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
                muiTableBodyCellProps: { sx: { px: 2, py: 0 } },
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
                        py: 1.5, width: '100%', height: '100%'
                    }}
                    >
                        {renderedCellValue}
                    </Box>
                )
            }
        ]
    }, [view, maxLoading]);

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

    // Show heatmap
    const [showHeatmap, setShowHeatmap] = useState(false);
    const setShowHeatmapTrue = useCallback(() => setShowHeatmap(true), [setShowHeatmap]);

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
        muiTableBodyCellProps: { sx: { px: 0, py: 0 } },
        enableFilters: true,
        enableGlobalFilter: false,
        initialState: { showColumnFilters: true },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            }}>
                <Box>
                    <Button
                        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                        onClick={() => handleExportData(
                            featureInfo,
                            table.getAllColumns().map(
                                e => ({ key: e.columnDef.id, displayLabel: e.columnDef.header })
                            ),
                            `Biomolecules_${pathway}`,
                        )}
                        startIcon={<FileDownloadIcon />}
                    >
                        Export Table
                    </Button>
                </Box>
                <Box><Typography variant='body1'>{pathwayInfo.Name}</Typography></Box>
                {false && <Box><Typography variant='body1'>{pathway}</Typography></Box>}
                <Box>
                    <Button
                        //onClick={() => setShowHeatmap(true)}
                        onClick={setShowHeatmapTrue}
                        startIcon={<GradientIcon />}
                    >
                        Plot Heatmap
                    </Button>
                </Box>
            </Box>
        )
    })


    return (
        <Box>
            <MaterialReactTable table={table} />
            <HeatMapDialog
                showHeatmap={showHeatmap}
                setShowHeatmap={setShowHeatmap}
                featureInfo={featureInfo}
                pathway={pathway}
                pathwayInfo={pathwayInfo}
            />
        </Box>
    )
}

const HeatMapDialog = ({
    setShowHeatmap,
    showHeatmap,
    featureInfo,
    pathway,
    pathwayInfo
}) => {

    // Get general variables
    const xi = useJob().norm;
    const { mdataType } = useJob();
    const { mdataCategoricalRes, workingOmics } = useResults().PWA;
    const { projections } = useResults().PWA.jobStatus.pwa_res;

    // Heatmap z legend
    const [zLegend, setZLegend] = useState({ min: -2, max: 2 });

    // Sort samples by first score (decresing)
    const samplesSortedGroup = useMemo(() => {

        mdataType[mdataCategoricalRes.mdataCol].level2id[mdataCategoricalRes.g1.id];
        mdataType[mdataCategoricalRes.mdataCol].level2id[mdataCategoricalRes.g2.id];

        let samplesSorted = projections.toSorted(
            (a, b) => (a.proj[0] < b.proj[0] ? 1 : -1)
        ).map(e => e.sample);

        let samplesSortedGroup = {
            g1: samplesSorted.filter(e =>
                mdataType[mdataCategoricalRes.mdataCol].level2id[mdataCategoricalRes.g1.id].includes(e)
            ),
            g2: samplesSorted.filter(e =>
                mdataType[mdataCategoricalRes.mdataCol].level2id[mdataCategoricalRes.g2.id].includes(e)
            )
        }

        return samplesSortedGroup;
    }, [projections, mdataType, mdataCategoricalRes]);

    const hmDataGroup = useMemo(() => {
        const xiJson = {}
        workingOmics.map(omic => {
            xiJson[omic] = danfo2RowColJson(xi[`x${omic}`]);
        });

        const hmDataGroup = {}
        console.log(featureInfo)

        hmDataGroup.g1 = featureInfo.map(f => ({
            id: f.xId,
            data: samplesSortedGroup.g1.map(sample => ({
                x: sample,
                y: -xiJson[f.omic][sample][f.xId],
                name: f.Name
            }))
        }));

        hmDataGroup.g2 = featureInfo.map(f => ({
            id: f.xId,
            data: samplesSortedGroup.g2.map(sample => ({
                x: sample,
                y: -xiJson[f.omic][sample][f.xId],
                name: f.Name
            }))
        }));

        return hmDataGroup;
    }, [workingOmics, samplesSortedGroup, featureInfo, xi]);

    return (
        <Dialog
            open={showHeatmap}
            maxWidth='xl'
            onClose={() => setShowHeatmap(false)}
            className="printable"
        >
            <Box className="no-printable" sx={{ position: 'relative', top: 40, left: 10, width: 0 }}>
                <DownloadHeatmap name={'Pathway-Analysis'} />
            </Box>
            <Box sx={{}}>
                <DialogTitle>{pathway} | {pathwayInfo.Name}</DialogTitle>
                <DialogContent sx={{ overflowX: 'hidden' }}>
                    <Box sx={{ display: 'flex', border: '0px solid red' }}>
                        <Box sx={{ border: '0px solid red' }}>
                            <Typography sx={{ fontSize: '1em', textAlign: 'right' }}><span>&#8203;</span></Typography>
                            <HeatMapCanvas
                                width={100}
                                height={30 * featureInfo.length}
                                data={featureInfo.map(e => ({ id: e.xId, data: [] }))}
                                margin={{ top: 0, right: 0, bottom: 0, left: 100 }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: '',
                                    legendPosition: 'middle',
                                    legendOffset: 40
                                }}

                            />
                        </Box>
                        <Box sx={{ border: '0px solid blue' }}>
                            <Typography sx={{ textAlign: 'center' }}>{mdataCategoricalRes.g1.id}</Typography>
                            <HeatMapCanvas
                                height={30 * featureInfo.length}
                                width={Math.min(550, samplesSortedGroup.g1.length * 8)}
                                data={hmDataGroup.g1}
                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                axisLeft={null}
                                axisTop={{
                                    tickSize: 0,
                                    tickPadding: 0,
                                    tickRotation: 0,
                                    legend: '',
                                    legendOffset: 0
                                }}

                                colors={{
                                    type: 'diverging',
                                    scheme: 'red_blue',
                                    minValue: -zLegend.max,
                                    maxValue: -zLegend.min,
                                    //divergeAt: 0
                                }}
                                emptyColor="#555555"
                                ///isInteractive={false}
                                animate={false}
                                enableLabels={false}
                                tooltip={(props) => CustomTooltipComponent(props)}
                            />
                        </Box>
                        <Box sx={{ mx: 0.2, width: 0, border: '1px solid rgba(0,0,0,1)' }}></Box>
                        <Box sx={{ }}>
                            <Typography sx={{ textAlign: 'center' }}>{mdataCategoricalRes.g2.id}</Typography>
                            <HeatMapCanvas
                                height={30 * featureInfo.length}
                                width={Math.min(550, samplesSortedGroup.g2.length * 8)}
                                data={hmDataGroup.g2}
                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                axisLeft={null}
                                axisTop={{
                                    tickSize: 0,
                                    tickPadding: 0,
                                    tickRotation: 0,
                                    legend: '',
                                    legendOffset: 0
                                }}

                                colors={{
                                    type: 'diverging',
                                    scheme: 'red_blue',
                                    minValue: -zLegend.max,
                                    maxValue: -zLegend.min,
                                    //divergeAt: 0
                                }}
                                emptyColor="#555555"
                                //isInteractive={false}
                                animate={false}
                                enableLabels={false}
                                tooltip={(props) => CustomTooltipComponent(props)}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ width: "50%", position: 'relative', left: 17 }}>
                        <Legend a={zLegend.min} b={zLegend.max} setZLegend={setZLegend} />
                    </Box>
                    <Box className="no-printable">
                        <Button onClick={() => setShowHeatmap(false)}>Close</Button>
                    </Box>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

const Legend = ({ a, b, setZLegend }) => {

    // User inserted values
    const [usrVal, setUsrVal] = useState({ min: a, max: b });

    // Calcular el valor medio
    const media = (a + b) / 2;

    // Establecer los colores de gradiente
    const colorRojo = `#9e2a2b`;
    const colorBlanco = `rgb(255, 255, 255)`;
    const colorAzul = `#1f4e79`;

    // Calcular la posición del blanco en el gradiente
    const blancoPosicion = ((media - a) / (b - a)) * 100;

    // Establecer el estilo del componente
    const estilo = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        //width: '100%',
        padding: '10px',
        //background: `linear-gradient(to right, ${colorAzul}, ${colorBlanco} ${blancoPosicion}%, ${colorRojo})`,
        background: `linear-gradient(to right, #053061 0%, #296fad 12%, #7cb6d6 24%, #97c6df 36%, #ffffff 50%, #f7bca1 62%, #f3ab8d 74%, #cf5349 86%, #67001f 100%)`,
        color: '#fff',
        height: '15px'
    };

    const handleInput = (minmax, value) => {

        const numValue = Number(value);

        setUsrVal(prev => ({ ...prev, [minmax]: value }));

        if (typeof numValue == 'number' && (!isNaN(numValue))) {
            setZLegend(prev => ({ ...prev, [minmax]: numValue }))
            /*updateZLegend(draft => {
                draft[omic][minmax] = numValue
            });
            dispatchResults({ type: 'update-zlegend', omic, minmax, numValue });
            plotHeatMap();*/
        }
    }

    return (
        <div style={estilo}>
            <div>
                <input
                    type='text'
                    style={{ width: 30, height: 20, textAlign: 'center' }}
                    value={usrVal.min}
                    onChange={e => handleInput('min', e.target.value)}
                />
            </div>
            <div style={{ color: 'black' }}>{media.toFixed(0)}</div>
            <div>
                <input
                    type='text'
                    style={{ width: 30, height: 20, textAlign: 'center' }}
                    value={usrVal.max}
                    onChange={e => handleInput('max', e.target.value)}
                />
            </div>
        </div>
    );
};

const CustomTooltipComponent = ({ cell }) => {
    console.log(cell)
    return (
        <Box sx={{
            border: '1px solid rgba(0,0,0,0.5)',
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.8)',
            p: 2,
            position: 'relative', top: 50,
            //maxWidth:200
        }}
        >
            <Typography variant='body2'>Sample: <strong>{cell.data.x}</strong></Typography>
            <Typography variant='body2'>Biomolecule: <strong>{cell.data.name}</strong></Typography>
            <Typography variant='body2'>Value: <strong>{-cell.data.y.toExponential(4)}</strong></Typography>
        </Box>
    )
}

export default PathwayExplorer