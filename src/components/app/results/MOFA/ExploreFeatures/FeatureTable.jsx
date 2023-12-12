import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

//MRT Imports
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_GlobalFilterTextField,
    MRT_ToggleFiltersButton,
} from 'material-react-table';

//Material UI Imports
import {
    Box,
    Button,
    ListItemIcon,
    MenuItem,
    Typography,
    lighten,
} from '@mui/material';
import { useJob } from '@/components/app/JobContext';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import { useResults } from '@/components/app/ResultsContext';
import { Splide, SplideSlide } from '@splidejs/react-splide';
//import '@splidejs/react-splide/css';
import "@splidejs/splide/dist/css/splide.min.css"
import { MySection, MySectionContainer } from '@/components/MySection';
import GProfiler from './GProfiler';
import MetabolomicSetSelector from './MetabolomicSetSelector';
import GSEA from './GSEA';

//Icons Imports

//Mock Data

function FeatureTable({ omic, thrLRef }) {
    
    // Row filtered by the user
    const fRef = useRef({ up: [], down: [] });

    // When user modify the main table, a re-render is produced
    const [reRender, setReRender] = useState(false);
    const myReRender = useCallback(() => setReRender(prev => !prev), []);
    useEffect( () => {
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
            }, [xi, mdataColInfo]);
        }

        return f2MeanL
    })

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
    }, [omic, f2i, mdataColInfo]);

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
    }, [omic, f2i]);


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

        renderTopToolbar: ({ table }) => {
            const myFlatRows = table.getFilteredRowModel().flatRows;
            const myRows = myFlatRows.map(e => e.original);
            const myRowsID = myFlatRows.map(e => e.id);

            const [rows, setRows] = useState([]);
            const [rowsID, setRowsID] = useState([]);

            useEffect(() => {
                fRef.current[sign] = rows;
                const myTimeOut = setTimeout(() => {myReRender(); console.log('rendered')}, 5000);
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
        }
    })

    return (
        <Box sx={{ px: 5, pb: 3 }}>
            <MaterialReactTable table={table} />
            {false && <Box onClick={() => console.log(table.getFilteredRowModel())}>Click</Box>}
        </Box>
    )
}

export default FeatureTable