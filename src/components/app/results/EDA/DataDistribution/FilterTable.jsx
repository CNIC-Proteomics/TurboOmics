import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import MyMotion from '@/components/MyMotion';

export default function FilterTable({ columns, data }) {

    //console.log(data)

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
        enableColumnResizing: false,
        enableColumnVirtualization: true,
        enableGlobalFilterModes: false,
        enablePagination: false,
        enableColumnPinning: false,
        enableRowNumbers: false,
        enableRowVirtualization: true,
        enableColumnFilters: false,
        muiTableContainerProps: { sx: { maxHeight: '450px' } },
        onSortingChange: setSorting,
        state: { isLoading, sorting },
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
        columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    });

    return (
        <MyMotion>
            <div style={{ opacity: 0.9, width: "100%", margin: 'auto' }}>
                <MaterialReactTable table={table} />
            </div>
        </MyMotion>
    );
};