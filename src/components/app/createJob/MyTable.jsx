import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { makeData } from './makeData';
import { useJob } from '../JobContext';
import MyMotion from '@/components/MyMotion';

export default function MyTable() {

    //optionally access the underlying virtualizer instance
    const rowVirtualizerInstanceRef = useRef(null);

    //const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sorting, setSorting] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            //setData(makeData(1_000));
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

    // Get annotation column
    let m2i = useJob().user.m2i
    const annotationColumn = useJob().annotations.column

    // If annotation column is not selected or not included in m2i table, do not show
    if (annotationColumn == null || !m2i.columns.includes(annotationColumn)) return <></>

    let m2iJSON = dfd.toJSON(m2i);

    let data = m2i.index.map((ID, i) => ({ ID: ID, [annotationColumn]: m2iJSON[i][annotationColumn] }))

    const columns = [{
        accessorKey: 'ID',
        header: 'ID',
        size: 50,
    },
    {
        accessorKey: annotationColumn,
        header: annotationColumn,
        size: 170,
    }]

    return (
        <MyMotion>
            <div style={{ opacity: 0.9, width: "50%", margin: 'auto' }}>
                <MaterialReactTable
                    columns={columns}
                    data={data} //10,000 rows
                    enableBottomToolbar={false}
                    enableTopToolbar={true}
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

//virtualizerInstanceRef was renamed to rowVirtualizerInstanceRef in v1.5.0
//virtualizerProps was renamed to rowVirtualizerProps in v1.5.0

//export default Example;
