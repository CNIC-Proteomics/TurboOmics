import React from 'react'

import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

export default function MyBoxPlotPlotly({data, xrange, xTicks}) {
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
                    range:xrange,
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
