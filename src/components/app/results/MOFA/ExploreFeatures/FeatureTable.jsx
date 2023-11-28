import { useMemo } from 'react';

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

//Icons Imports

//Mock Data

function FeatureTable({ omic, thrLRef }) {

    return (
        <Splide aria-label="My Favorite Images">
            <SplideSlide>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant='h5'>Positively Associated</Typography>
                    <MyMRTable omic={omic} sign='+' thr={thrLRef[omic].up} />
                </Box>
            </SplideSlide>
            <SplideSlide>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant='h5'>Negatively Associated</Typography>
                    <MyMRTable omic={omic} sign='-' thr={thrLRef[omic].down} />
                </Box>
            </SplideSlide>
        </Splide>
    )
};

const MyMRTable = ({ omic, sign, thr }) => {
    const f2i = useJob().user[`${omic}2i`];
    const factor = useResults().MOFA.displayOpts.selectedPlot.Factor;
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

        columns.push({
            header: factor,
            accessorKey: factor,
            muiTableHeadCellProps: {
                align: 'left',
            },
            muiTableBodyCellProps: {
                align: 'center',
            },
            filterFn: sign == '+' ? 'greaterThan' : 'lessThan'
        })

        return columns;
    }, [omic, f2i]);

    /*
    Get data
    */
    const data = useMemo(() => {
        let f2iJson = danfo2RowColJson(f2i.fillNa(''));

        let data = {};

        Object.keys(myLoadings).filter(
            f => sign == '+' ? myLoadings[f] > 0 : myLoadings[f] < 0
        ).map(
            f => {
                data[f] = {
                    ...f2iJson[f], [factor]: Math.round(myLoadings[f] * 10000) / 10000
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
            sorting: [{ id: factor, desc: sign == '+' ? true : false }]
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
    })

    return (
        <MaterialReactTable table={table} />
    )
}

export default FeatureTable