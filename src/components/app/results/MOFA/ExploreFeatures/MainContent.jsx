import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

//Material UI Imports
import {
    Box,
    Typography,
} from '@mui/material';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import "@splidejs/splide/dist/css/splide.min.css"

import { useJob } from '@/components/app/JobContext';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import { useResults } from '@/components/app/ResultsContext';
import { MySection, MySectionContainer } from '@/components/MySection';
import EnrichmentQ from './EnrichmentQ';
import EnrichmentM from './EnrichmentM';
import MyMRTable from './MyMRTable';
import { useVars } from '@/components/VarsContext';

function MainContent({ omic, thrLRef }) {

    const { OMIC2NAME } = useVars()

    // Features associated to factor
    const f2i = useJob().user[`${omic}2i`];
    const factor = useResults().MOFA.displayOpts.selectedPlot.Factor;
    const myLoadings = useResults().MOFA.data.loadings[omic][factor];
    const fFact = useMemo(() => {
        const f2iJson = danfo2RowColJson(f2i);
        const fFact = { up: [], down: [] };

        Object.keys(myLoadings).map(e => {
            if (myLoadings[e] > thrLRef.up)
                fFact.up.push(f2iJson[e]);

            if (myLoadings[e] < thrLRef.down)
                fFact.down.push(f2iJson[e]);
        });

        return fFact
    }, [f2i, myLoadings, thrLRef.up, thrLRef.down]);

    // Get mean of each feature per level
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const xi = useJob().norm[`x${omic}`];

    const f2MeanL = useMemo(() => {
        const f2MeanL = {};
        const xiJson = danfo2RowColJson(xi);

        // Calculate mean only for factor filtered
        const allF = [
            ...fFact.up.map(f => Object.values(f)[0]),
            ...fFact.down.map(f => Object.values(f)[0])
        ];

        const xiJsonF = {};
        Object.keys(xiJson).map(i => {
            xiJsonF[i] = {};
            allF.map(f => xiJsonF[i][f] = xiJson[i][f])
        });

        allF.map(f => { f2MeanL[f] = {} });

        if (mdataColInfo.type == 'categorical') {
            mdataColInfo.levels.map(l => {
                let xiL = new dfd.DataFrame(
                    mdataColInfo.level2id[l]
                        .map(element => xiJsonF[element])
                        .filter(i => i != undefined)
                );

                const fMeanSerie = xiL.mean({ axis: 0 }).round(4);

                fMeanSerie.index.map((f, i) => {
                    f2MeanL[f][l] = fMeanSerie.values[i];
                });
            });
        }

        return f2MeanL
    }, [xi, mdataColInfo, fFact.down, fFact.up]);


    // Selection of column containing protein/transcript ID
    const [colFid, setColFid] = useState(
        omic == 'm' ? null : 
        { label: f2i.columns[0], id: f2i.columns[0] }
    );

    // Array containing enriched categories filtered by user
    // They will be downloadable from main table
    const [q2cat, setQ2cat] = useState({ up: {}, down: {} });

    const setQ2cat_sign = useMemo(() => {
        const setQ2cat_sign = {};
        setQ2cat_sign['up'] = (arr) => setQ2cat(prev => ({ ...prev, up: arr }));
        setQ2cat_sign['down'] = (arr) => setQ2cat(prev => ({ ...prev, down: arr }));
        return setQ2cat_sign;
    }, [setQ2cat]);

    return (
        <Splide aria-label="My Favorite Images">
            {['up', 'down'].map(sign => (
                <SplideSlide key={sign}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant='h5'>
                            {sign == 'up' ? 'Positively' : 'Negatively'} Associated {OMIC2NAME[omic]}
                        </Typography>
                        <MySectionContainer height='75vh'>
                            <MySection>
                                <MyMRTable
                                    omic={omic}
                                    sign={sign}
                                    thr={thrLRef[sign]}
                                    f2MeanL={f2MeanL}
                                    q2cat={q2cat[sign]}
                                    colFid={colFid}
                                />

                                {fFact[sign].length > 0 &&
                                    <Box>
                                        {omic == 'q' || omic == 't' ?
                                            <EnrichmentQ
                                                omic={omic}
                                                fRef={fFact[sign]}
                                                f2MeanL={f2MeanL}
                                                colFid={colFid}
                                                setColFid={setColFid}
                                                setQ2cat={setQ2cat_sign[sign]}
                                            />
                                            :
                                            <EnrichmentM
                                                fRef={fFact[sign]}
                                                f2MeanL={f2MeanL}
                                                colFid={colFid}
                                                setColFid={setColFid}
                                                setM2cat={setQ2cat_sign[sign]}
                                            />
                                        }
                                    </Box>
                                }
                            </MySection>
                        </MySectionContainer>
                    </Box>
                </SplideSlide>
            ))
            }
        </Splide >
    )
};

export default MainContent