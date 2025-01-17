import { useJob } from '@/components/app/JobContext';
import { Box, TextField, Button, IconButton } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { MySelect } from '@/components/app/results/EDA/DataDistribution/MyFormComponents';
import MyMotion from '@/components/MyMotion';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import GridOnIcon from '@mui/icons-material/GridOn';
import DownloadIcon from '@mui/icons-material/Download';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import { useVars } from '@/components/VarsContext';

export default function TableLoadings({ omic, selectedLoadings, selectedPCA }) {

    const {OMIC2NAME} = useVars();
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

            // Filter by regex
            let regex = new RegExp('');
            try {
                regex = new RegExp(filterText);
            } catch {
                regex = new RegExp('');
            }
            filteredFeatures = filteredFeatures.filter(
                featureObj => {
                    return (
                        featureObj['mdataValue'] != null &&
                        regex.test(featureObj['mdataValue'])
                    )
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
                })
            )
        }

        return { filteredFeatures, columns }
    }, [selectedLoadings, filterText, filterCol, f2i, selectedPCA]);

    return (
        <Box sx={{ width: "95%", margin: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb:1 }}>
                <Box sx={{ mt: 3, ml: 0 }}>
                    <IconButton
                        aria-label="download"
                        size='small'
                        onClick={e => downloadTable(OMIC2NAME[omic], filteredFeatures, columns)}
                        sx={{ opacity: 0.5 }}
                        variant='danger'
                    >
                        <DownloadIcon />
                    </IconButton>
                </Box>
                <Box sx={{ width: '40%', pt: 0, pb:0, ml: 3 }}>
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
            <Box sx={{ mt: 0, border:'0px solid red' }}>
                <FilterTable data={filteredFeatures} columns={columns} />
            </Box>
        </Box>
    )
}

const downloadTable = (name, data, columns) => {
    const csvConfig = mkConfig({
        useKeysAsHeaders: true,
        filename: `PCA_Loading_Table-${name}`
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
        muiTableContainerProps: { sx: { maxHeight: '510px' } },
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