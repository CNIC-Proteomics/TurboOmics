import { useJob } from '@/components/app/JobContext'
import { Box, Button, Typography } from '@mui/material';
//import { BarChart } from '@mui/x-charts';

import { Cell, BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { myPalette } from '@/utils/myPalette';
import { useVars } from '@/components/VarsContext';
import Image from 'next/image';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { DownloadComponent } from '@/utils/DownloadRechartComponent';

function GProfiler({ fRef, setCategory }) {

    const BASE_URL = useVars().BASE_URL;
    const [qSet, setQSet] = useState([]);
    const [goRes, setGoRes] = useState(null);

    const q2i = useJob().user.q2i;
    const { OS } = useJob()
    const myBackg = useMemo(() => q2i.index, [q2i]);
    const mySet = fRef.map(e => e[q2i.columns[0]]);

    if (
        !mySet.map(e => qSet.includes(e)).every(e => e) ||
        !qSet.map(e => mySet.includes(e)).every(e => e)
    ) {
        setQSet(mySet);
    }

    const gProfiler = useCallback(async () => {
        const res = await fetch(
            'https://biit.cs.ut.ee/gprofiler/api/gost/profile/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "organism": OS.id,
                    "query": qSet,
                    "domain_scope": "custom",
                    "background": myBackg,
                    "user_threshold": 1e-1,
                    "significance_threshold_method": "bonferroni",
                    'sources': ['GO:MF', 'GO:BP', 'GO:CC']//, 'GO:CC', 'KEGG', 'REAC']
                })
            }
        )
        const resJson = await res.json();
        setGoRes(resJson);
    }, [OS, qSet, myBackg]);

    useEffect(() => {
        const myTimeOut = setTimeout(gProfiler, 100);
        return () => clearTimeout(myTimeOut);
    }, [qSet, myBackg, gProfiler]);

    const myData = useMemo(() => {
        if (goRes == null) return null;
        const myData = goRes.result.map(e => ({
            ...e,
            '-Log10(pvalue)': Math.round(-Math.log10(e.p_value) * 10000) / 10000,
            'FDR': Number.parseFloat(e.p_value).toExponential(2)
        }));
        return myData
    }, [goRes]);

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ mr: 2 }}><Typography variant='h6'>GO Enrichment with</Typography></Box>
                <Box sx={{ cursor: 'pointer' }} onClick={() => window.open("https://biit.cs.ut.ee/gprofiler/gost", "_blank", "noreferrer")}>
                    <Image
                        src={`${BASE_URL}/gProfiler_logo.png`}
                        width={110}
                        height={30}
                        className="d-inline-block align-top"
                        alt="g:Profiler"
                    /></Box>
            </Box>
            <Box>
                {myData && <>
                    <Box sx={{
                        border: '0px solid #999999',
                        borderRadius: 5,
                        p: 1,
                        maxWidth: 700,
                        m: 'auto'
                    }}>
                        <MyBarChart myData={myData} />
                    </Box>
                    <Box sx={{ pl: 2, mt: 1 }}>
                        <CategoryTable myData={myData} setCategory={setCategory} />
                    </Box>
                </>}
            </Box>
        </ Box>
    )
}

const MyBarChart = ({ myData }) => {
    const plotRef = useRef()
    return (
        <Box sx={{
            height: 480,
            overflowY: 'auto',
            overflowX: 'hidden',
        }}>
            <Box sx={{
                width: 550,
                m: 'auto',
            }}>
                <DownloadComponent scatterRef={plotRef} fileName='GO_Enrichment' />
                <BarChart
                    ref={plotRef}
                    width={530}
                    height={Math.max(500, 35 * myData.length)}
                    data={myData}
                    margin={{
                        top: 0,
                        right: 0,
                        left: 50,
                        bottom: 20,
                    }}
                    layout='vertical'
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis type='category' dataKey="native" />
                    <XAxis type='number'>
                        <Label value={`-Log10(pvalue)`} offset={-10} position="insideBottom" />
                    </XAxis>
                    <Tooltip
                        content={<CustomTooltip />}
                    />
                    <Legend content={() => <CustomLegend />} align="center" verticalAlign="top" />
                    <Bar dataKey='-Log10(pvalue)' barSize={15}>
                        {myData.map(e => (
                            <Cell key={e.native} fill={getColor(e.source)} />
                        ))}
                    </Bar>
                </BarChart>
            </Box>
        </Box>
    )
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                className="custom-tooltip"
                sx={{
                    width: 400,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(50, 50, 50, 0.8)',
                    padding: 1,
                    borderRadius: 1,
                    color: 'rgba(50,50,50,1)'
                }}
            >
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`${payload[0].payload.source} - ${payload[0].payload.native}`}</Typography>}
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`${payload[0].payload.name}`}</Typography>}
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`${payload[0].payload.description}`}</Typography>}
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`FDR = ${payload[0].payload.FDR}`}</Typography>}
            </Box>
        );
    }

    return null;
};

const CustomLegend = () => {
    const legendData = [
        { value: 'GO:MF', color: myPalette[0] },
        { value: 'GO:BP', color: myPalette[1] },
        { value: 'GO:CC', color: myPalette[2] },
    ];
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            {legendData.map((entry, index) => (
                <div key={index} style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '15px', height: '15px', backgroundColor: entry.color, marginRight: '5px' }} />
                    <span>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const getColor = (category) => {
    switch (category) {
        case 'GO:MF': {
            return myPalette[0]
        }
        case 'GO:BP': {
            return myPalette[1]
        }
        case 'GO:CC': {
            return myPalette[2]
        }
    }
}

const CategoryTable = ({ myData, setCategory }) => {
    const handleExportData = () => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: `Protein_GO_Enrichment`
        });

        const data = myData.map(e => ({
            'GO': e.native,
            'Type': e.source,
            'Name': e.name,
            'FDR': e.FDR
        }));

        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };
    const columns = useMemo(() => ([
        {
            header: 'GO',
            accessorKey: 'native',
            size: 70
        },
        {
            header: 'Type',
            accessorKey: 'source',
            size: 50
        },
        {
            header: 'Name',
            accessorKey: 'name'
        },
        {
            header: 'FDR',
            accessorKey: 'FDR',
            size: 70
        },
    ]), []);

    // Row selection for GSEA
    const [rowSelection, setRowSelection] = useState({});
    useEffect(() => {
        const catIndex = parseInt(Object.keys(rowSelection)[0]);
        if (!isNaN(catIndex)) {
            setCategory(myData[catIndex]);
        }
    }, [rowSelection, myData, setCategory])

    //optionally access the underlying virtualizer instance
    const rowVirtualizerInstanceRef = useRef(null);

    //const [data, setData] = useState(myData);
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
        data: myData, //10,000 rows
        //defaultDisplayColumn: { enableResizing: true },
        layoutMode: 'grid',
        enableBottomToolbar: false,
        enableColumnResizing: true,
        enableColumnVirtualization: true,
        //enableGlobalFilterModes: true,
        enablePagination: false,
        enableColumnPinning: false,
        enableRowNumbers: false,
        enableRowVirtualization: true,
        enableRowActions: false,
        enableRowSelection: true,
        enableMultiRowSelection: false,
        enableDensityToggle: false,
        enableColumnFilters: false,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnActions:false, 
        muiTableContainerProps: { sx: { maxHeight: '250px' } },
        onSortingChange: setSorting,
        initialState: {
            density: 'compact',
            showGlobalFilter: true,
            showColumnFilters: false
        },
        state: { isLoading, sorting },
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 10 }, //optionally customize the row virtualizer
        columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
        positionToolbarAlertBanner: 'bottom', //move the alert banner to the bottom
        getRowId: (row) => row.userId, //give each row a more useful id
        muiTableBodyRowProps: ({ row }) => ({
            //add onClick to row to select upon clicking anywhere in the row
            onClick: row.getToggleSelectedHandler(),
            sx: { cursor: 'pointer' },
        }),
        onRowSelectionChange: setRowSelection, //connect internal row selection state to your own
        state: { rowSelection },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                    onClick={handleExportData}
                    startIcon={<FileDownloadIcon />}
                >
                    Export All Data
                </Button>
            </Box>
        )
    });

    return <MaterialReactTable table={table} />;
};

export default GProfiler