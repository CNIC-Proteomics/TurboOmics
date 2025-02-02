import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import { myPalette } from "@/utils/myPalette";


export default function MyHistogram({
    dataHist,
    gValues,
    xrange,
    yrange,
    xTicks,
    figRef,
    omic
}) {
    return (
        <AreaChart
            ref={(node) => { figRef.current[omic]['Hist'] = node }}
            style={{ margin: 'auto' }}
            width={500}
            height={210}
            data={dataHist}
            margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={'binCenter'} type='number' ticks={xTicks} domain={xrange} style={{fontFamily: 'Calibri'}} />
            <YAxis domain={yrange} style={{fontFamily: 'Calibri'}} />
            <Tooltip />
            {
                gValues.map(
                    (g, i) => (
                        <Area
                            connectNulls
                            type='monotone'
                            dataKey={g}
                            fillOpacity={0.3}
                            key={g}
                            stroke={myPalette[i % myPalette.length]}
                            fill={myPalette[i % myPalette.length]}
                        >
                        </Area>
                    )
                )
            }

        </AreaChart>
    )
}
