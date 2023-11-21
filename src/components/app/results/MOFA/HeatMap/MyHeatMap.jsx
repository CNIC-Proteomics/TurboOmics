import { useJob } from '@/components/app/JobContext'
import React from 'react'
import { ResponsiveHeatMap, HeatMap, ResponsiveHeatMapCanvas  } from '@nivo/heatmap'
import { Box } from '@mui/material';

function MyHeatMap({ omic, myIndex, myFeat, mdataCol, showYAxis }) {

    const xi = useJob().norm[`x${omic}`];
    const mdataColInfo = useJob().mdataType[mdataCol];

    console.log(mdataColInfo)

    /*
    Get data to plot heatmap
    */

    let hmData = {};
    myIndex.map(e => { hmData[e] = [] });
    myFeat.map(f => {
        let fCol = xi.column(f);
        fCol.index.map(
            (e, i) => [e, fCol.values[i]]
        ).filter(
            e => myIndex.includes(e[0])
        ).map(e => {
            hmData[e[0]].push({ x: f, y: e[1] })
        });
    });

    if (mdataColInfo.type == 'categorical') {

        hmData = mdataColInfo.levels.map(lv => (
            mdataColInfo.level2id[lv].filter(idx => myIndex.includes(idx)).map(idx => ({
                id: `${idx}-${lv}`,
                data: hmData[idx]
            }))
        )).flat();

    } else if (mdataColInfo.type == 'numeric') {
        hmData = myIndex.map(idx => ({
            id: idx,
            data: hmData[idx]
        }));
    }
    console.log(hmData);

    /**/


    //xi.loc({rows:[myIndex[0]]}).print()

    //xi.print()

    return (
        <Box sx={{height:500, width: showYAxis ? '10%' : '20%', border:'1px solid red'}}>
            <ResponsiveHeatMapCanvas 
                data={hmData}
                margin={{ top: 0, right: 0, bottom: 0, left: showYAxis ? 100 : 0 }}
                height={500}
                //width={500}
                //valueFormat=">-.2s"
                axisTop={{
                    tickSize: 0,
                    tickPadding: 0,
                    tickRotation: 0,
                    legend: '',
                    legendOffset: 0
                }}
                /*axisRight={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'country',
                    legendPosition: 'middle',
                    legendOffset: 70
                }}*/
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 0,
                    tickRotation: 0,
                    //legend: 'country',
                    legendPosition: 'middle',
                    legendOffset: 0
                }}
                colors={{
                    type: 'diverging',
                    scheme: 'red_blue',
                    minValue: -2,
                    maxValue: 2,
                    divergeAt: 0.5
                }}
                emptyColor="#555555"
                /*legends={[
                    {
                        anchor: 'bottom',
                        translateX: 0,
                        translateY: 30,
                        length: 400,
                        thickness: 8,
                        direction: 'row',
                        tickPosition: 'after',
                        tickSize: 3,
                        tickSpacing: 4,
                        tickOverlap: false,
                        tickFormat: '>-.2s',
                        title: 'Value →',
                        titleAlign: 'start',
                        titleOffset: 4
                    }
                ]}*/
                isInteractive={false}
                animate={false}
                enableLabels={false}
            />
        </Box>
    )
}

export default MyHeatMap