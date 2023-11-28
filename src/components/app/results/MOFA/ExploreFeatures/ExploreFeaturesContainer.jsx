import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import React, { useEffect, useMemo, useState } from 'react';
import OmicSelector from './OmicSelector';
import TopBarDialog from './TopBarDialog';
import { MySection, MySectionContainer } from '@/components/MySection';
import FeatureTable from './FeatureTable';
import { Box } from '@mui/material';
import MyMotion from '@/components/MyMotion';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import "@splidejs/splide/dist/css/splide.min.css"

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function ExploreFeaturesContainer({
    exploreF,
    setExploreF,
    Factor,
    thrLRef
}) {

    const [selectedOmic, setSelectedOmic] = useState('q');
    const [showContent, setShowContent] = useState(false);

    /*useEffect(() => {
        //setShowContent(false);
        const myTimeOut = setTimeout(() => setShowContent(true), 2500);
        return () => clearTimeout(myTimeOut);
    }, [exploreF]);*/


    return (
        <Dialog
            fullScreen
            open={exploreF}
            TransitionComponent={Transition}
        >
            <TopBarDialog setExploreF={setExploreF} setShowContent={setShowContent} Factor={Factor} />
            <OmicSelector selectedOmic={selectedOmic} setSelectedOmic={setSelectedOmic} />
            {true && <MySectionContainer height='85vh'>
                <MySection>
                    <Splide>
                        <SplideSlide>
                            <div /*hidden={selectedOmic == 'q' ? true : false}*/ >
                                <FeatureTable omic='q' thrLRef={thrLRef} />
                            </div>
                        </SplideSlide>
                        <SplideSlide>
                            <div /*hidden={selectedOmic == 'm' ? true : false}*/ >
                                <FeatureTable omic='m' thrLRef={thrLRef} />
                            </div>
                        </SplideSlide>
                    </Splide>
                </MySection>
            </MySectionContainer>}
        </Dialog >
    )
}

export default ExploreFeaturesContainer