import { useJob } from '@/components/app/JobContext'
import React, { useEffect, useMemo } from 'react'
import { ResponsiveHeatMap, HeatMap, ResponsiveHeatMapCanvas } from '@nivo/heatmap'
import { Box, Typography } from '@mui/material';

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
        <Box sx={{ height: 510, width: 290, marginRight:0.5, border: '2px solid #444444' }}>
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

export const HeatMapIndex = ({ myIndex, mdataCol }) => {

    const mdataColInfo = useJob().mdataType[mdataCol];

    const hmData = useMemo(
        () => getHmData(myIndex, [], null, mdataColInfo),
        [myIndex, mdataColInfo]
    )

    const arrayA = hmData.map(e => e.id.split('##')).map(e => e[e.length - 1]);

    // Crear un objeto para realizar el conteo de frecuencias
    const frequencyCount = {};
    arrayA.forEach((value) => {
        frequencyCount[value] = (frequencyCount[value] || 0) + 1;
    });

    // Obtener valores únicos del array y ordenarlos
    const uniqueValues = [...new Set(arrayA)];

    return (
        <table>
            <tbody>
                {uniqueValues.map((value, index) => (
                    <tr
                        key={index}
                        style={{
                            height: frequencyCount[value] * 500 / arrayA.length,
                            borderTop: '2px solid #444444',
                            borderBottom: '2px solid #444444',
                        }}
                    >
                        <td style={{paddingRight:5}}><Typography variant='h7'>{value}</Typography></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

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
                id: `${idx}##${lv}`,
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