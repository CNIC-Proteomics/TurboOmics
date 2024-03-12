import { useJob } from '@/components/app/JobContext';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table/dist';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { download, generateCsv, mkConfig } from 'export-to-csv';

function MetabolomicSetSelector({ setLoadingEnrichment, fRef, updateMCat }) {

    const { m2i } = useJob().user;
    const options = useMemo(
        () => m2i.columns.map(e => ({ label: e, value: e })).slice(1),
        [m2i]
    );
    const [selectedField, setSelectedField] = useState(options[0]);

    useEffect(() => {
        const myTimeOut = setTimeout(() => setLoadingEnrichment(false), 2000);
        return () => clearTimeout(myTimeOut);
    }, [fRef, setLoadingEnrichment])

    return (
        <Box sx={{ textAlign: 'center' }}>
            <FieldSelector
                options={options}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
            />
            <Box sx={{ opacity: selectedField ? 1 : 0, transition: 'all ease 1s' }}>
                {selectedField && <CategoryTable
                    selectedField={selectedField}
                    fRef={fRef}
                    updateMCat={updateMCat}
                />}
            </Box>
        </Box>
    )
}

const FieldSelector = ({ options, selectedField, setSelectedField }) => {

    const handleInput = (e, newValue) => {
        if (newValue)
            setSelectedField(newValue);
        else
            setSelectedField(options[0])
    }

    return (
        <Box>
            <Typography variant='h6'>Apply Filter to Create Category</Typography>
            <Autocomplete
                id="metabolomics-feature-field"
                sx={{ width: 300, margin: 'auto', mt: 2 }}
                disableListWrap
                value={selectedField}
                onChange={(e, newValue) => handleInput(e, newValue)}
                options={options}
                renderInput={(params) => <TextField {...params} label="Field" />}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option.label}>
                            {option.label}
                        </li>
                    );
                }}
            />
        </Box>
    )
}

const CategoryTable = ({ selectedField, fRef, updateMCat }) => {

    const idCol = useJob().user.m2i.columns[0];
    const { m2i } = useJob().user;

    const mySet = useMemo(() => {
        const mySet = {};
        fRef.map(e => { mySet[e[idCol]] = true });
        return mySet
    }, [fRef, idCol]);

    const myData = useMemo(() => {
        const m2iJson = danfo2RowColJson(m2i);
        const mySetArr = Object.keys(mySet);
        let data = [];
        data = Object.keys(m2iJson).map(
            e => ({
                ...m2iJson[e],
                filtered: mySetArr.includes(e) ? 1 : 0
            })
        );

        data.sort((a, b) => (b.filtered - a.filtered));
        return data
    }, [m2i, mySet]);

    const columns = useMemo(() => ([
        {
            header: 'ID',
            accessorKey: idCol,
            size: 30
        },
        {
            header: selectedField.value,
            accessorKey: selectedField.value,
            //size: 60
        },
    ]), [selectedField, idCol]);

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
        data: myData,
        layoutMode: 'grid',
        enableBottomToolbar: false,
        positionToolbarAlertBanner: 'bottom',
        enableSelectAll: false,
        enablePagination: false,
        enableRowPinning: false,
        enableRowSelection: false,
        enableStickyHeader: true,
        enableColumnPinning: false,
        enableDensityToggle: false,
        enableColumnFilters: false,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnActions: false,
        enableGlobalFilter: true,
        rowPinningDisplayMode: 'select-sticky',
        muiTableContainerProps: { sx: { maxHeight: '400px' } },
        enableRowVirtualization: true,
        enableColumnVirtualization: true,
        getRowId: (row) => row[idCol],
        state: {
            rowSelection: mySet,
            isLoading, sorting
        },
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 },
        columnVirtualizerOptions: { overscan: 2 },
        initialState: {
            rowSelection: mySet,
            density: 'compact',
            showGlobalFilter: true,
        },

        filterFns: {
            myCustomFilterFn: (row, id, filterValue) => {
                if (row.getValue(id)) {
                    let regex = new RegExp('');
                    try {
                        regex = new RegExp(filterValue);
                    } catch {
                        regex = new RegExp('');
                    }
                    return regex.test(row.getValue(id))//.startsWith(filterValue)
                }
                else {
                    return false
                }
            }
        },
        globalFilterFn: 'myCustomFilterFn',

        renderTopToolbarCustomActions: ({ table }) => (
            <MyTopToolbarActions
                table={table}
                updateMCat={updateMCat}
            />
        )
    });

    return (
        <>
            <MaterialReactTable table={table} />
        </>
    )
};

const MyTopToolbarActions = ({ table, updateMCat }) => {

    const mIndex = useJob().user.m2i.index;
    const mIndexFiltered = table.getFilteredRowModel().rows.map(e => e.id);

    const [savedMIndexFiltered, setSavedMIndexFiltered] = useState([]);

    if (
        !savedMIndexFiltered.map(e => mIndexFiltered.includes(e)).every(e => e) ||
        !mIndexFiltered.map(e => savedMIndexFiltered.includes(e)).every(e => e)
    ) {
        setSavedMIndexFiltered(mIndexFiltered)
    }

    useEffect(() => {
        let myTimeOut;

        if (
            !mIndex.map(e => savedMIndexFiltered.includes(e)).every(e => e)
        ) {
            myTimeOut = setTimeout(() => updateMCat(savedMIndexFiltered), 1000);
        }
        else {
            myTimeOut = setTimeout(() => updateMCat(null), 1000);
        }

        return () => clearInterval(myTimeOut);
    }, [savedMIndexFiltered, mIndex, updateMCat]);

    const handleExportRows = (rows) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `Category_Metabolites`
        });
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '16px',
                padding: '8px',
                flexWrap: 'wrap',
            }}
        >
            <Button
                disabled={table.getFilteredRowModel().rows.length === 0}
                onClick={() =>
                    handleExportRows(table.getFilteredRowModel().rows)
                }
                startIcon={<FileDownloadIcon />}
            >
                Export Filtered Rows
            </Button>
        </Box>
    )
}

export default MetabolomicSetSelector