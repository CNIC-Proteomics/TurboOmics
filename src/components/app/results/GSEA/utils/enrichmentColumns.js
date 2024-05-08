const common = {
    muiTableHeadCellProps: {
        align: 'center',
    },
    muiTableBodyCellProps: {
        align: 'center',
    }
}

export const COLUMNS = {
    t: [
        {
            header: 'Pathway',
            accessorKey: 'pathway',
            size: 310,
            ...common
        },
        {
            header: 'pval',
            accessorKey: 'pval',
            size: 80,
            filterFn: 'lessThanOrEqualTo',
            ...common,
            columnFilterModeOptions: [],

        },
        {
            header: 'padj',
            accessorKey: 'padj',
            filterFn: 'lessThanOrEqualTo',
            size: 80,
            columnFilterModeOptions: [],
            ...common
        },
        {
            header: 'ES',
            accessorKey: 'ES',
            filterFn: 'greaterThanOrEqualTo',
            size: 80,
            columnFilterModeOptions: ['lessThanOrEqualTo', 'greaterThanOrEqualTo'],
            ...common
        },
        {
            header: 'NES',
            accessorKey: 'NES',
            size: 100,
            filterFn: 'greaterThanOrEqualTo',
            columnFilterModeOptions: ['lessThanOrEqualTo', 'greaterThanOrEqualTo'],
            ...common
        },
        {
            header: 'N. Leading Edge',
            accessorKey: 'nLeadingEdge',
            filterFn: 'greaterThanOrEqualTo',
            columnFilterModeOptions: ['lessThanOrEqualTo', 'greaterThanOrEqualTo'],
            size: 180,
            ...common
        },
        {
            header: 'Size',
            accessorKey: 'size',
            size: 80,
            filterFn: 'greaterThanOrEqualTo',
            columnFilterModeOptions: ['lessThanOrEqualTo', 'greaterThanOrEqualTo'],
            ...common
        },
    ],

    m: [
        {
            header: 'Pathway',
            accessorKey: 'pathway',
            size: 400,
            ...common,
        },        
        {
            header: 'pval',
            accessorKey: 'p-value',
            size: 80,
            filterFn: 'lessThanOrEqualTo',
            ...common,
            columnFilterModeOptions: [],

        },
        {
            header: 'Overlap Size',
            accessorKey: 'overlap_size',
            size: 180,
            filterFn: 'greaterThanOrEqualTo',
            ...common,
            columnFilterModeOptions: ['lessThanOrEqualTo', 'greaterThanOrEqualTo'],

        },
        {
            header: 'Pathway Size',
            accessorKey: 'pathway_size',
            size: 180,
            filterFn: 'greaterThanOrEqualTo',
            ...common,
            columnFilterModeOptions: ['lessThanOrEqualTo', 'greaterThanOrEqualTo'],

        },
    ]
}