import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import MyMotion from '@/components/MyMotion';

export default function FilterTable({ columns, data }) {

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
            </div>
        </MyMotion>
    );
};