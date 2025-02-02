import { useJob } from '@/components/app/JobContext'
import { Box, Button, Typography } from '@mui/material';

import { Cell, BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { myPalette } from '@/utils/myPalette';
import { useVars } from '@/components/VarsContext';
import Image from 'next/image';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table/dist';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { DownloadComponentBarChart } from '@/utils/DownloadRechartComponent';


const DATABASES = ['GO:MF', 'GO:BP', 'GO:CC', 'KEGG', 'REAC']

function GProfiler({
    omic,
    fRef,
    setCategory,
    colFid,
    setQ2cat
}) {

    const BASE_URL = useVars().BASE_URL;

    const f2i = useJob().user[`${omic}2i`];
    const { OS } = useJob();

    // Save result of gProfiler
    const [goRes, setGoRes] = useState(null); // All categories

    // Background genes to be sent to gProfiler
    const myBackg = useMemo(() => {
        const f = f2i.column(colFid.id).values
        return f.filter((item, pos) => f.indexOf(item) == pos) // drop duplicates
    }, [f2i, colFid]); // All proteins in exp.

    // Target genes
    const fSet = useMemo(() => {
        const f = fRef.map(e => e[colFid.id]);
        return f.filter((item, pos) => f.indexOf(item) == pos) // drop duplicates
    }, [colFid, fRef]); // Filtered proteins

    // gProfiler fetch
    const gProfiler = useCallback(async () => {

        const URI =['https://biit.cs.ut.ee/gprofiler/api/gost/profile/',
            'https://biit.cs.ut.ee/gprofiler_beta/api/gost/profile/'];

        const fetchGProfiler = (URI) => {
            return new Promise(async (resolve, reject) => {
                console.log('Trying ', URI);
                try {
                    const res = await fetch(
                        URI,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                "organism": OS.id,
                                "query": fSet,
                                "domain_scope": "custom",
                                "background": myBackg,
                                "user_threshold": 1e-1,
                                "significance_threshold_method": "bonferroni",
                                'sources': DATABASES
                            })
                        }
                    );
                    resolve(res);
                } catch (error) {
                    reject(error)
                }

            });
        }

        let res;
        try {
            res = await fetchGProfiler(URI[0]);
        } catch (error) {
            console.log(error);
            res = await fetchGProfiler(URI[1]);
        }

        /*const res = await fetch(
            'https://biit.cs.ut.ee/gprofiler/api/gost/profile/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "organism": OS.id,
                    "query": fSet,
                    "domain_scope": "custom",
                    "background": myBackg,
                    "user_threshold": 1e-1,
                    "significance_threshold_method": "bonferroni",
                    'sources': DATABASES
                })
            }
        );*/
        const resJson = await res.json();

        // Find features per category
        const myid2ensgs = resJson.meta.genes_metadata.query.query_1.mapping
        resJson.ensgs2myid = {};
        Object.keys(myid2ensgs).map((e, i) => {
            resJson.ensgs2myid[Object.values(myid2ensgs)[i][0]] = e;
        });

        resJson.myid = resJson.meta.genes_metadata.query.query_1.ensgs.map(
            e => resJson.ensgs2myid[e]
        );

        resJson.result = resJson.result.map(e => ({
            ...e,
            myid: resJson.myid.filter((f, i) => e.intersections[i].length > 0)
        }));

        resJson.myid.length == 0 && alert("No protein/transcript ID could be mapped. Please, check that organism and column containing ID were correctly selected");

        setGoRes(resJson);

    }, [OS, fSet, myBackg]);

    useEffect(() => {
        const myTimeOut = setTimeout(gProfiler, 100);
        return () => clearTimeout(myTimeOut);
    }, [fSet, myBackg, gProfiler]);

    // Extract gProfiler result
    const myData = useMemo(() => {
        if (goRes == null) return null;
        const myData = goRes.result.map(e => ({
            ...e,
            '-Log10(pvalue)': Math.round(-Math.log10(e.p_value) * 10000) / 10000,
            'FDR': Number.parseFloat(e.p_value).toExponential(2),
            'labelName': e.name.split(' ').slice(0, 4).join(' ') + (e.name.split(' ').length > 4 ? '...' : '')
        }));
        return myData
    }, [goRes]);

    // Filter myData using FDR
    const [myUsrFilt, setMyUsrFilt] = useState([]);

    const myDataF = useMemo(() => {
        if (myData === null) return null;
        const myDataF = myData.filter(e => myUsrFilt.includes(e.native))
        return myDataF
    }, [myData, myUsrFilt]);


    // Build object matching protein to category
    useEffect(() => {
        if (myDataF === null) return;

        const q2cat = {};
        goRes.myid.map(f => {
            q2cat[f] = [];
        });
        myDataF.map(e => {
            e.myid.map(f => q2cat[f].push(e))
        });
        setQ2cat(q2cat);

    }, [myDataF, goRes, setQ2cat])

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
                    />
                </Box>
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
                        <MyBarChart myData={myDataF} />
                    </Box>
                    <Box sx={{ pl: 2, mt: 1, width: "206%" }}>
                        <CategoryTable
                            myData={myData}
                            setCategory={setCategory}
                            myUsrFilt={myUsrFilt}
                            setMyUsrFilt={setMyUsrFilt}
                        />
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
            height: 520,
            overflowY: 'auto',
            overflowX: 'hidden',
        }}>
            <Box sx={{
                width: 550,
                m: 'auto',
            }}>
                <Box sx={{ width: 0, position: 'relative', left: 50 }}>
                    <DownloadComponentBarChart scatterRef={plotRef} name='GO_Enrichment' />
                </Box>
                <BarChart
                    ref={plotRef}
                    width={530}
                    height={Math.max(480, 80 * myData.length)}
                    data={myData}
                    margin={{
                        top: 0,
                        right: 0,
                        left: 150,
                        bottom: 20,
                    }}
                    layout='vertical'
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis
                        type='category'
                        //dataKey="labelName"
                        dataKey="name"
                        minTickGap={30}
                        style={{ fontFamily: 'Calibri', border:'1px solid red' }}
                        padding={{top:30}}
                    />
                    <XAxis type='number'
                        style={{ fontFamily: 'Calibri' }}
                    >
                        <Label
                            value={`-Log10 (FDR)`}
                            offset={-10}
                            position="insideBottom"
                            style={{ fontFamily: 'Calibri' }}
                        />
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
                    width: 350,
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
        { value: 'KEGG', color: myPalette[3] },
        { value: 'REAC', color: myPalette[4] },
    ].filter(e => DATABASES.includes(e.value));
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
        case 'KEGG': {
            return myPalette[3]
        }
        case 'REAC': {
            return myPalette[4]
        }
    }
}

const CategoryTable = ({ myData, setCategory, myUsrFilt, setMyUsrFilt }) => {
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
            size: 100,
        },
        {
            header: 'Type',
            accessorKey: 'source',
            size: 170,
            filterVariant: 'multi-select'
        },
        {
            header: 'Name',
            accessorKey: 'name',
            size: 220,
        },
        {
            header: 'FDR',
            accessorKey: 'FDR',
            size: 50,
            filterFn: 'lessThan'
        },
    ]), []);

    // Row selection for GSEA
    const initialSelectedRow = useMemo(() => {
        return myData.length > 0 ? { [myData[0].native]: true } : {}
    }, [myData]);
    const [rowSelection, setRowSelection] = useState(initialSelectedRow);

    useEffect(() => {
        if (Object.keys(rowSelection).length == 0) {
            setCategory(null);
        } else {
            setCategory(
                myData.filter(e => e.native == Object.keys(rowSelection)[0])[0]
            );
        };
    }, [rowSelection, myData, setCategory]);

    const table = useMaterialReactTable({
        columns,
        data: myData, //10,000 rows
        //defaultDisplayColumn: { enableResizing: true },
        layoutMode: 'grid',
        enableBottomToolbar: false,
        enableColumnResizing: true,
        //enableColumnVirtualization: true,
        //enableGlobalFilterModes: true,
        enablePagination: false,
        enableColumnPinning: false,
        enableRowNumbers: false,
        //enableRowVirtualization: true,
        enableRowActions: false,
        enableRowSelection: true,
        enableMultiRowSelection: false,
        enableDensityToggle: false,
        enableColumnFilters: true,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnActions: false,
        muiTableContainerProps: { sx: { maxHeight: '250px' } },
        //onSortingChange: setSorting,
        enableFacetedValues: true,
        initialState: {
            density: 'compact',
            showGlobalFilter: true,
            showColumnFilters: true,
            columnFilters: [{ id: 'FDR', value: 0.1 }],
            rowSelection: { initialSelectedRow }
        },
        positionToolbarAlertBanner: 'bottom', //move the alert banner to the bottom
        getRowId: (row) => row.native, //give each row a more useful id
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

    // Capture user filter
    const [usrFilt, setUsrFilt] = useState(myData.map(e => e.native));
    const newUsrFilt = table.getFilteredRowModel().rows.map(e => e.id);

    if (
        !usrFilt.every(e => newUsrFilt.includes(e)) ||
        !newUsrFilt.every(e => usrFilt.includes(e))
    ) {
        setUsrFilt(newUsrFilt);
    }

    useEffect(() => {
        console.log('Setting ID')
        if (
            !myUsrFilt.every(e => usrFilt.includes(e)) ||
            !usrFilt.every(e => myUsrFilt.includes(e))
        ) {
            setMyUsrFilt(usrFilt)
        }
    }, [usrFilt, setMyUsrFilt, myUsrFilt]);

    return (
        <>
            <MaterialReactTable table={table} />
        </>
    )
};

export default GProfiler