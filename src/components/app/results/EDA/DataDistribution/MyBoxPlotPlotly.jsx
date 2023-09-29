import { myPalette } from '@/utils/myPalette';
import { Box } from '@mui/material';
import React from 'react'
//import Plot from 'react-plotly.js';
//const Plot = require('react-plotly.js').default;

import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

export default function MyBoxPlotPlotly({data, range, xTicks}) {
    var trace1 = {
        x: [1, 2, 3, 4, 4, 4, 8, 9, 10],
        type: 'box',
        name: 'Set 1',
        marker: {color: myPalette[0]}
    };

    var trace2 = {
        x: [2, 3, 3, 3, 3, 5, 6, 6, 7],
        type: 'box',
        name: 'Set 2',
        marker: {color: myPalette[1]}
    };

    //var data = [trace1, trace2];

    return (
        <Plot
            style={{ position:'relative', left: -20}}
            data={data}
            layout={{
                width:570,
                height: 280,
                showlegend: true,
                legend: {"orientation": "h"},
                xaxis: {
                    zeroline: false,
                    range:range,
                    tickvals: xTicks,
                },
                yaxis: {
                    type:'category',
                    showticklabels: false,
                },
                margin:{
                    t:0
                }
            }}
            config={{staticPlot: true, displayModeBar:false}}
            onChange={e => console.log(e)}
        />
    )
}
