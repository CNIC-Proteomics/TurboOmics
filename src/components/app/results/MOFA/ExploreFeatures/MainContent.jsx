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

//Icons Imports

//Mock Data

function MainContent({ omic, thrLRef }) {

    // Row filtered by the user
    const fRef = useRef({ up: [], down: [] });

    // When user modify the main table, a re-render is produced
    const [reRender, setReRender] = useState(false);
    const myReRender = useCallback(() => setReRender(prev => !prev), []);
    useEffect(() => { // Execute reRender after the first rendering
        const myTimeOut = setTimeout(myReRender, 2000);
        return () => clearTimeout(myTimeOut);
    }, [myReRender]);

    // Soft appearance of Enrichment section
    const [loadingEnrichment, setLoadingEnrichment] = useState(true);

    // Get mean of each feature per level
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const xi = useJob().norm[`x${omic}`];

    const f2MeanL = useMemo(() => {
        const f2MeanL = {};
        const xiJson = danfo2RowColJson(xi);
        xi.columns.map(i => { f2MeanL[i] = {} });

        if (mdataColInfo.type == 'categorical') {
            mdataColInfo.levels.map(l => {
                let xiL = new dfd.DataFrame(
                    mdataColInfo.level2id[l].map(element => xiJson[element]).filter(i => i != undefined)
                );

                const fMeanSerie = xiL.mean({ axis: 0 }).round(4);

                fMeanSerie.index.map((f, i) => {
                    f2MeanL[f][l] = fMeanSerie.values[i];
                });
            });
        }

        return f2MeanL
    }, [xi, mdataColInfo]);

    return (
        <Splide aria-label="My Favorite Images">
            {['up', 'down'].map(sign => (
                <SplideSlide key={sign}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant='h5'>
                            {sign == 'up' ? 'Positively' : 'Negatively'} Associated {omic == 'q' ? 'Proteins' : 'Metabolites'}
                        </Typography>
                        <MySectionContainer height='80vh'>
                            <MySection>
                                <MyMRTable
                                    omic={omic}
                                    sign={sign}
                                    thr={thrLRef[omic][sign]}
                                    fRef={fRef}
                                    myReRender={myReRender}
                                    f2MeanL={f2MeanL}
                                    setLoadingEnrichment={setLoadingEnrichment}
                                />

                                {fRef.current[sign].length > 0 &&
                                    <Box sx={{ opacity: loadingEnrichment?0:1, transition:'all ease 1s' }}>
                                        {omic == 'q' ?
                                            <EnrichmentQ
                                                fRef={fRef.current[sign]}
                                                f2MeanL={f2MeanL}
                                                setLoadingEnrichment={setLoadingEnrichment}
                                            />
                                            :
                                            <EnrichmentM
                                                fRef={fRef.current[sign]}
                                                f2MeanL={f2MeanL}
                                                setLoadingEnrichment={setLoadingEnrichment}
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