import { useJob } from '@/components/app/JobContext'
import React, { useEffect, useMemo } from 'react'
import { ResponsiveHeatMap, HeatMap, ResponsiveHeatMapCanvas } from '@nivo/heatmap'
import { Box } from '@mui/material';

export function MyHeatMap({ omic, myIndex, myFeat, mdataCol, updateZLegend, zLegend }) {

    const xi = useJob().norm[`x${omic}`];
    const mdataColInfo = useJob().mdataType[mdataCol];

    /*
    Get data to plot heatmap
    */
    const hmData = useMemo(
        () => getHmData(myIndex, myFeat, xi, mdataColInfo),
        [myIndex, myFeat, xi, mdataColInfo]
    )
    /**/

    /*
    Set Legend values
    */
    useEffect(() => {

        const Zarr = Object.keys(hmData).map(idx => (
            hmData[idx].data.map(e => e.y)
        )).flat();

        Zarr.sort((a, b) => a - b);

        updateZLegend(draft => {
            draft[omic].min = Math.floor(Math.min(
                draft[omic].min,
                Zarr[Math.floor(0.1 * Zarr.length)]
            ));
            draft[omic].max = Math.ceil(Math.max(
                draft[omic].max,
                Zarr[Math.floor(0.9 * Zarr.length)]
            ));
        });
    }, [hmData, omic, updateZLegend])
    /**/

    return (
        <Box sx={{ height: 500, mx: 0.5, width: 260 }}>
            <ResponsiveHeatMapCanvas
                data={hmData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                axisTop={{
                    tickSize: 0,
                    tickPadding: 0,
                    tickRotation: 0,
                    legend: '',
                    legendOffset: 0
                }}

                colors={{
                    type: 'diverging',
                    scheme: 'red_blue',
                    minValue: zLegend.min,
                    maxValue: zLegend.max,
                    //divergeAt: 0
                }}
                emptyColor="#555555"
                isInteractive={false}
                animate={false}
                enableLabels={false}
            />
        </Box>
    )
}

export const MyHeatMapIndex = ({ myIndex, mdataCol }) => {

    const mdataColInfo = useJob().mdataType[mdataCol];

    const hmData = useMemo(
        () => getHmData(myIndex, [], null, mdataColInfo),
        [myIndex, mdataColInfo]
    )

    return (
        <Box sx={{ height: 500, mx: 0.5, width: '100%' }}>
            <ResponsiveHeatMapCanvas
                data={hmData}
                margin={{ top: 0, right: 0, bottom: 0, left: 100 }}
                height={500}

                axisLeft={{
                    tickSize: 0,
                    tickPadding: 0,
                    tickRotation: 0,
                    legend: 'Samples',
                    legendPosition: 'middle',
                    legendOffset: -80
                }}
                isInteractive={false}
                animate={false}
                enableLabels={false}
            />
        </Box>
    )
}


/*

*/

const getHmData = (myIndex, myFeat, xi, mdataColInfo) => {
    let hmData = {};
    myIndex.map(e => { hmData[e] = [] });
    myFeat.map(f => {
        let fCol = xi.column(f);
        fCol.index.map(
            (e, i) => [e, fCol.values[i]]
        ).filter(
            e => myIndex.includes(e[0])
        ).map(e => {
            hmData[e[0]].push({ x: f, y: -e[1] })
        });
    });

    if (mdataColInfo.type == 'categorical') {

        hmData = mdataColInfo.levels.map(lv => (
            mdataColInfo.level2id[lv].filter(
                idx => myIndex.includes(idx)
            ).map(idx => ({
                id: `${idx} | ${lv}`,
                data: hmData[idx]
            }))
        )).flat();

    } else if (mdataColInfo.type == 'numeric') {
        hmData = myIndex.map(idx => ({
            id: idx,
            data: hmData[idx]
        }));
    }

    return hmData
}