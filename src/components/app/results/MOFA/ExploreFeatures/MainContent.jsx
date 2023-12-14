import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

//MRT Imports
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_GlobalFilterTextField,
    MRT_ToggleFiltersButton,
} from 'material-react-table';
import { download, generateCsv, mkConfig } from 'export-to-csv';

//Material UI Imports
import {
    Box,
    Button,
    ListItemIcon,
    MenuItem,
    Typography,
    lighten,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import "@splidejs/splide/dist/css/splide.min.css"

import { useJob } from '@/components/app/JobContext';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import { useResults } from '@/components/app/ResultsContext';
import { MySection, MySectionContainer } from '@/components/MySection';
import GProfiler from './GProfiler';
import MetabolomicSetSelector from './MetabolomicSetSelector';
import GSEA from './GSEA';

//Icons Imports

//Mock Data

function MainContent({ omic, thrLRef }) {

    // Row filtered by the user
    const fRef = useRef({ up: [], down: [] });

    // When user modify the main table, a re-render is produced
    const [reRender, setReRender] = useState(false);
    const myReRender = useCallback(() => setReRender(prev => !prev), []);
    useEffect(() => { // Execute reRender after the first rendering
        const myTimeOut = setTimeout(myReRender, 2000);
        return () => clearTimeout(myTimeOut);
    }, [myReRender]);

    return (
        <Splide aria-label="My Favorite Images">
            {['up', 'down'].map(sign => (
                <SplideSlide key={sign}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant='h5'>
                            {sign == 'up' ? 'Positively' : 'Negatively'} Associated {omic == 'q' ? 'Proteins' : 'Metabolites'}
                        </Typography>
                        <MySectionContainer height='80vh'>
                            <MySection>
                                <MyMRTable
                                    omic={omic}
                                    sign={sign}
                                    thr={thrLRef[omic][sign]}
                                    fRef={fRef}
                                    myReRender={myReRender}
                                />
                            </MySection>
                            <MySection>
                                {fRef.current[sign].length > 0 &&
                                    <Box sx={{ display: 'flex' }}>
                                        <Box sx={{ width: '45%' }}>
                                            {omic == 'q' ?
                                                <GProfiler fRef={fRef.current[sign]} />
                                                :
                                                <MetabolomicSetSelector />
                                            }
                                        </Box>
                                        <Box sx={{ width: '45%' }}>
                                            <GSEA />
                                        </Box>
                                    </Box>
                                }
                            </MySection>
                        </MySectionContainer>
                    </Box>
                </SplideSlide>
            ))}
        </Splide>
    )
};

const MyMRTable = ({ omic, sign, thr, fRef, myReRender }) => {

    const xi = useJob().norm[`x${omic}`]
    const f2i = useJob().user[`${omic}2i`];
    const factor = useResults().MOFA.displayOpts.selectedPlot.Factor;
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const myLoadings = useResults().MOFA.data.loadings[omic][factor];

    const xiJson = danfo2RowColJson(xi);

    const f2MeanL = useMemo(() => {
        const f2MeanL = {};
        xi.columns.map(i => { f2MeanL[i] = {} });

        if (mdataColInfo.type == 'categorical') {
            mdataColInfo.levels.map(l => {
                let xiL = new dfd.DataFrame(
                    mdataColInfo.level2id[l].map(element => xiJson[element]).filter(i => i != undefined)
                );

                const fMeanSerie = xiL.mean({ axis: 0 }).round(4);

                fMeanSerie.index.map((f, i) => {
                    f2MeanL[f][l] = fMeanSerie.values[i];
                });
            });
        }

        return f2MeanL
    }, [xi, mdataColInfo])

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
        })

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


    const handleExportRows = (rows) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename:`${omic}_${factor}_vs_${mdataCol}_filtered`
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
            filename:`${omic}_${factor}_vs_${mdataCol}`
        });
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };
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
        enableFullScreenToggle: false,
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
        /*muiSearchTextFieldProps: {
          size: 'small',
          variant: 'outlined',
        },*/
        muiPaginationProps: {
            //color: 'secondary',
            rowsPerPageOptions: [10],//, 20, 30],
            shape: 'rounded',
            variant: 'outlined',
        },

        renderTopToolbar: ({ table }) => <MyRenderTopToolbar table={table} fRef={fRef} sign={sign} myReRender={myReRender}/> /*{
            const myFlatRows = table.getFilteredRowModel().flatRows;
            const myRows = myFlatRows.map(e => e.original);
            const myRowsID = myFlatRows.map(e => e.id);

            const [rows, setRows] = useState([]);
            const [rowsID, setRowsID] = useState([]);

            useEffect(() => {
                fRef.current[sign] = rows;
                const myTimeOut = setTimeout(() => { myReRender() }, 5000);
                return () => clearTimeout(myTimeOut);
            }, [rows]);

            // if new elements, set them and reRender
            if (
                !myRowsID.map(i => rowsID.includes(i)).every(e => e) ||
                !rowsID.map(i => myRowsID.includes(i)).every(e => e)
            ) {
                setRowsID(myRowsID);
                setRows(myRows);
            }

            return (<></>)
        }*/,

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
    })

    return (
        <Box sx={{ px: 5, pb: 3 }}>
            <MaterialReactTable table={table} />
        </Box>
    )
}

const MyRenderTopToolbar = ({ table, fRef, sign, myReRender }) => {
    const myFlatRows = table.getFilteredRowModel().flatRows;
    const myRows = myFlatRows.map(e => e.original);
    const myRowsID = myFlatRows.map(e => e.id);

    const [rows, setRows] = useState([]);
    const [rowsID, setRowsID] = useState([]);

    useEffect(() => {
        fRef.current[sign] = rows;
        const myTimeOut = setTimeout(() => { myReRender() }, 5000);
        return () => clearTimeout(myTimeOut);
    }, [rows, fRef, sign, myReRender]);

    // if new elements, set them and reRender
    if (
        !myRowsID.map(i => rowsID.includes(i)).every(e => e) ||
        !rowsID.map(i => myRowsID.includes(i)).every(e => e)
    ) {
        setRowsID(myRowsID);
        setRows(myRows);
    }

    return (<></>)
}

export default MainContent