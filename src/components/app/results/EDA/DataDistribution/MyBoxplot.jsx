// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/boxplot
import { ResponsiveBoxPlot } from '@nivo/boxplot'


// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export default function MyBoxblot({ data }) {
    return (
        <ResponsiveBoxPlot
            data={data}
            margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
            //minValue={0}
            //maxValue={10}
            subGroupBy="subgroup"
            layout="horizontal"
            padding={0.3}
            enableGridX={true}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendPosition: 'middle',
                legendOffset: 17
            }}
            axisLeft={null}
            //colors={{ scheme: 'category10' }}
            colors={[
                '#636EFA',
                '#EF553B',
                '#00CC96',
                '#AB63FA',
                '#FFA15A',
                '#19D3F3',
                '#FF6692',
                '#B6E880',
                '#FF97FF',
                '#FECB52'
            ]}
            colorBy="group"
            borderRadius={2}
            borderWidth={2}
            opacity={0.75}
            borderColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        0.3
                    ]
                ]
            }}
            medianWidth={2}
            medianColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        0.3
                    ]
                ]
            }}
            whiskerEndSize={0.6}
            whiskerColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        0.3
                    ]
                ]
            }}
            motionConfig="stiff"
            legends={[
                {
                    anchor: 'left',
                    direction: 'column',
                    justify: false,
                    translateX: -60,
                    translateY: 0,
                    itemWidth: 50,
                    itemHeight: 21,
                    itemsSpacing: 0,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    symbolSize: 8,
                    symbolShape: 'square',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemTextColor: '#000'
                            }
                        }
                    ]
                }
            ]}
        />
    )
}