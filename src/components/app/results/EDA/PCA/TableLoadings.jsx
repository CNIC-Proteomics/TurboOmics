import { useJob } from '@/components/app/JobContext';
import { Box, TextField, Button, IconButton } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { MySelect } from '@/components/app/results/EDA/DataDistribution/MyFormComponents';
import MyMotion from '@/components/MyMotion';
import { MaterialReactTable } from 'material-react-table';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import DownloadIcon from '@mui/icons-material/Download';
import GridOnIcon from '@mui/icons-material/GridOn';

export default function TableLoadings({ omic, selectedLoadings, selectedPCA }) {

    const [filterText, setFilterText] = useState('');
    const [filterCol, setFilterCol] = useState('All features');

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
                size: 100,
            },
            {
                accessorKey: 'PCA',
                header: `Loadings PCA${selectedPCA}`,
                size: 100
            }
        ]

        if (f2i.columns.includes(filterCol)) {

            filteredFeatures = f2i.column(filterCol);
            filteredFeatures = filteredFeatures.values.map(
                (value, i) => ({
                    ID: filteredFeatures.index[i],
                    mdataValue: value,
                    PCA: selectedLoadings[filteredFeatures.index[i]]
                })
            )

            filteredFeatures = filteredFeatures.filter(
                featureObj => {
                    return (
                        featureObj['mdataValue'] != null &&
                        `${featureObj['mdataValue']}`.toLowerCase().includes(filterText.toLowerCase()))
                }
            );

            columns[1].header = filterCol
        } else {
            filteredFeatures = f2i.index
            filteredFeatures = filteredFeatures.map(
                (value, i) => ({
                    ID: value,
                    mdataValue: '',
                    PCA: selectedLoadings[value]
                })
            )
        }

        filteredFeatures = filteredFeatures.filter(e => e.PCA != undefined);

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
                        sx={{ opacity: 0.5, color:'rgb(13,110,253)'}}
                        variant='danger'
                    >
                        <GridOnIcon />
                    </IconButton>
                </Box>
                <Box sx={{ width: '40%', pt: 1, ml: 3 }}>
                    <MySelect
                        options={[{ label: 'All features', value: 'All features' }, ...f2i.columns.map(c => ({ label: c, value: c }))]}
                        onChange={
                            e => setFilterCol(e.value)
                        }
                        value={{ label: filterCol, value: filterCol }}
                    />
                </Box>
                {f2i.columns.includes(filterCol) &&
                    <MyMotion><Box sx={{ mt: 3, ml: 3 }}>
                        <TextField
                            id="standard-name"
                            placeholder='Filter text'
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
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

    return (
        <MyMotion>
            <div style={{ opacity: 0.9, width: "100%", margin: 'auto' }}>
                {true && <MaterialReactTable
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
                />}
            </div>
        </MyMotion>
    );
};