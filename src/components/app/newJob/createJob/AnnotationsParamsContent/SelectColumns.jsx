import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { useJob } from '@/components/app/JobContext';


function SelectColumns({ annParams, setAnnParams }) {
    const { m2i } = useJob().user;
    const colOptions = useMemo(() => m2i.columns.map(e => ({ id: e, label: e })), [m2i]);
    let ionOptions = [];

    if (annParams.ionCol !== null) {
        ionOptions = [... new Set(m2i.column(annParams.ionCol.id).values)]
        ionOptions = ionOptions.map(e => ({ id: e, label: e }));
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <Box sx={{ width: '70%' }}>
                <Typography variant='h6' sx={{ textAlign: 'center' }}>
                    Metabolomic Metadata
                </Typography>
                <DisplayMetadataTable />
            </Box>
            <Box sx={{ width: '25%' }}>
                <Typography variant='h6' sx={{ textAlign: 'center' }}>
                    Set Columns
                </Typography>
                <ColumnSelector
                    id='mzCol'
                    label='m/z Column'
                    value={annParams.mzCol}
                    setAnnParams={setAnnParams}
                    options={colOptions}
                />
                <ColumnSelector
                    id='rtCol'
                    label='Retention Time Column'
                    value={annParams.rtCol}
                    setAnnParams={setAnnParams}
                    options={colOptions}
                />
                <ColumnSelector
                    id='ionCol'
                    label='Ionisation Mode Column'
                    value={annParams.ionCol}
                    setAnnParams={setAnnParams}
                    options={colOptions}
                />
                <Box sx={{
                    visibility: annParams.ionCol === null ? 'hidden' : 'visible',
                    opacity: annParams.ionCol === null ? 0 : 1,
                    transition: 'all 1s ease'
                }}
                >
                    <ColumnSelector
                        id='ionValPos'
                        label='Positive Ion Value'
                        value={annParams.ionValPos}
                        setAnnParams={setAnnParams}
                        options={ionOptions}
                    />
                    <ColumnSelector
                        id='ionValNeg'
                        label='Negative Ion Value'
                        value={annParams.ionValNeg}
                        setAnnParams={setAnnParams}
                        options={ionOptions}
                    />
                </Box>
            </Box>
        </Box>

    )
}


const DisplayMetadataTable = () => {

    const { m2i } = useJob().user

    const columns = useMemo(() => (
        m2i.columns.map(e => ({
            accessorKey: e,
            header: e,
            size: 150
        }))
    ), [m2i]);

    //optionally access the underlying virtualizer instance
    const rowVirtualizerInstanceRef = useRef(null);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const m2iJson = dfd.toJSON(m2i);
            setData(m2iJson);
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
        enableBottomToolbar: false,
        enableTopToolbar: false,
        enableColumnResizing: true,
        enableColumnVirtualization: true,
        enableGlobalFilterModes: true,
        enablePagination: false,
        enableColumnPinning: true,
        enableRowNumbers: false,
        enableRowVirtualization: true,
        muiTableContainerProps: { sx: { maxHeight: '378px' } },
        onSortingChange: setSorting,
        state: { isLoading, sorting },
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
        columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    });

    return (
        <Box sx={{ mt: 3 }}>
            <MaterialReactTable table={table} />
        </Box>
    );
};

const ColumnSelector = ({ id, label, value, setAnnParams, options }) => {

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Autocomplete
                id="virtualize-demo"
                sx={{ width: 300 }}
                disableListWrap
                value={value}
                onChange={(e, newValue) => {
                    setAnnParams(prev => ({ ...prev, [id]: newValue }))
                    if (id =='ionCol') {
                        setAnnParams(prev => ({ ...prev, ionValPos: null, ionValNeg: null }))
                    } 
                }}
                options={options}
                renderInput={(params) => <TextField {...params} label={label} />}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option.id}>
                            {option.label}
                        </li>
                    );
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />
        </Box>
    )
}

export default SelectColumns