import { useJob } from '@/components/app/JobContext';
import { Box, TextField, Button, IconButton } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { MySelect } from '@/components/app/results/EDA/DataDistribution/MyFormComponents';
import MyMotion from '@/components/MyMotion';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';

export default function TableLoadings({ omic, selectedLoadings, selectedPCA }) {

    const dispatchResults = useDispatchResults();
    const { displayOpts } = useResults().EDA.PCA[omic];
    const [filterText, setFilterText] = useState('');
    const [filterCol, setFilterCol] = useState(displayOpts.filterCol);

    const f2i = useJob().user[`${omic}2i`];

    const { filteredFeatures, columns } = useMemo(() => {
        console.log('calculating filteredFeatures')

        let filteredFeatures = {}
        let columns = [
            {
                accessorKey: 'ID',
                header: 'ID',
                size: 60,
            },
            {
                accessorKey: 'mdataValue',
                header: '',
                size: 10,
            },
            ...selectedPCA.map((e, i) => ({
                accessorKey: `PCA${i}`,
                header: `Loadings PCA${e}`,
                //size: 100
            }))
        ]

        if (f2i.columns.includes(filterCol)) {

            filteredFeatures = f2i.column(filterCol);
            filteredFeatures = filteredFeatures.values.map(
                (value, i) => {
                    if (selectedLoadings[filteredFeatures.index[i]] == undefined) return null
                    return {
                        ID: filteredFeatures.index[i],
                        mdataValue: value,
                        ...selectedLoadings[filteredFeatures.index[i]].reduce(
                            (prev, curr, i) => ({ ...prev, [`PCA${i}`]: curr }),
                            { 'PCA0': selectedLoadings[filteredFeatures.index[i]][0] })
                    }
                }
            ).filter(e => e != null)

            filteredFeatures = filteredFeatures.filter(
                featureObj => {
                    return (
                        featureObj['mdataValue'] != null &&
                        `${featureObj['mdataValue']}`.toLowerCase().includes(filterText.toLowerCase()))
                }
            );

            columns[1].header = filterCol;
            columns[1].size = 100;
        } else {
            filteredFeatures = Object.keys(selectedLoadings).map(
                (value, i) => ({
                    ID: value,
                    mdataValue: '',
                    ...selectedLoadings[value].reduce(
                        (prev, curr, i) => ({ ...prev, [`PCA${i}`]: curr }),
                        { 'PCA0': selectedLoadings[value][0] }
                    )
                    //PCA: selectedLoadings[value]
                })
            )
        }

        //filteredFeatures = filteredFeatures.filter(e => e.PCA != undefined);
        return { filteredFeatures, columns }
    }, [selectedLoadings, filterText, filterCol, f2i, selectedPCA]);

    return (
        <Box sx={{ width: "95%", margin: 'auto' }}>
            <Box sx={{ display: 'flex', height: '10vh' }}>
                <Box sx={{ mt: 4, ml: 0 }}>
                    <IconButton
                        aria-label="download"
                        size='small'
                        onClick={e => downloadTable(filteredFeatures, columns)}
                        sx={{ opacity: 0.5, color: 'rgb(13,110,253)' }}
                        variant='danger'
                    >
                        <GridOnIcon />
                    </IconButton>
                </Box>
                <Box sx={{ width: '40%', pt: 1, ml: 3 }}>
                    <MySelect
                        options={[{ label: 'All features', value: 'All features' }, ...f2i.columns.map(c => ({ label: c, value: c }))]}
                        onChange={e => {
                            setFilterCol(e.value);
                            dispatchResults({ type: 'set-filter-col', value: e.value, omic })
                        }}
                        value={{ label: filterCol, value: filterCol }}
                    />
                </Box>
                {f2i.columns.includes(filterCol) &&
                    <MyMotion><Box sx={{ mt: 3, ml: 3 }}>
                        <TextField
                            id="standard-name"
                            placeholder='Filter text'
                            value={filterText}
                            onChange={e => {
                                setFilterText(e.target.value);
                                //dispatchResults({type: 'set-filter-text', value:e.target.value, omic})

                            }}
                        />
                    </Box></MyMotion>
                }
            </Box>
            <Box sx={{ mt: 0 }}>
                <FilterTable data={filteredFeatures} columns={columns} />
            </Box>
        </Box>
    )
}

const downloadTable = (data, columns) => {
    const csvConfig = mkConfig({
        useKeysAsHeaders: true,
        filename: 'PCA_Loading_Table'
    });

    const newData = data.map(oldObj => {
        let newObj = {}
        columns.map(colObj => {
            if (colObj.header != '') {
                newObj[colObj.header] = oldObj[colObj.accessorKey];
            }
        })
        return newObj
    });

    const csv = generateCsv(csvConfig)(newData);
    download(csvConfig)(csv)
}

function FilterTable({ columns, data }) {

    //optionally access the underlying virtualizer instance
    const rowVirtualizerInstanceRef = useRef(null);

    //const [data, setData] = useState([]);
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
        data, //10,000 rows
        defaultDisplayColumn: { enableResizing: true },
        layoutMode: 'grid',
        enableBottomToolbar: false,
        enableTopToolbar: false,
        enableColumnResizing: true,
        enableColumnVirtualization: true,
        enableGlobalFilterModes: false,
        enablePagination: false,
        enableColumnPinning: false,
        enableRowNumbers: false,
        enableColumnFilters: false,
        enableRowVirtualization: true,
        muiTableContainerProps: { sx: { maxHeight: '560px' } },
        onSortingChange: setSorting,
        state: { isLoading, sorting },
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
        columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    });

    return (
        <MyMotion>
            <div style={{ opacity: 0.9, width: "100%", margin: 'auto' }}>
                {true && <MaterialReactTable table={table} />}
            </div>
        </MyMotion>
    );
};

/*

                <MaterialReactTable
                    columns={columns}
                    data={data} //10,000 rows
                    enableBottomToolbar={false}
                    enableTopToolbar={false}
                    enableColumnResizing
                    enableColumnVirtualization
                    enableColumnActions={false}
                    enableColumnFilters={false}
                    enableGlobalFilterModes={false}
                    enableFullScreenToggle={false}
                    enablePinning={false}
                    enablePagination={false}
                    enableRowNumbers={false}
                    enableDensityToggle={false}
                    enableRowVirtualization
                    muiTableContainerProps={{ sx: { maxHeight: '500px' } }}
                    onSortingChange={setSorting}
                    state={{ isLoading, sorting }}
                    rowVirtualizerInstanceRef={rowVirtualizerInstanceRef} //optional
                    rowVirtualizerProps={{ overscan: 1 }} //optionally customize the row virtualizer
                    columnVirtualizerProps={{ overscan: 2 }} //optionally customize the column virtualizer
                />
                */