import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import OmicSelector from './OmicSelector';
import TopBarDialog from './TopBarDialog';
import { MySection, MySectionContainer } from '@/components/MySection';
import MainContent from './MainContent';
import { Box } from '@mui/material';
import "@splidejs/splide/dist/css/splide.min.css"

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function ExploreFeaturesContainer({
    exploreF,
    setExploreF,
    Factor,
    mdataCol,
    thrLRef
}) {

    const [selectedOmic, setSelectedOmic] = useState('q');
    const boxOmicRef = useRef(null);

    const scrollOmic = direction => {
        const container = boxOmicRef.current;
        const containerWidth = container.clientWidth

        if (direction == 'right')
            container.scrollLeft = container.scrollLeft + containerWidth;

        if (direction == 'left')
            container.scrollLeft = container.scrollLeft - containerWidth;
    }

    return (
        <Dialog
            fullScreen
            open={exploreF}
            TransitionComponent={Transition}
        >
            <TopBarDialog
                setExploreF={setExploreF}
                title={`Explore Features: ${Factor} vs ${mdataCol}`}
            />
            <OmicSelector
                selectedOmic={selectedOmic}
                setSelectedOmic={setSelectedOmic}
                scrollOmic={scrollOmic}
            />
            <Box sx={{ overflow: 'hidden' }} ref={boxOmicRef}>
                <Box
                    sx={{ display: 'flex', width: '200%' }}
                >
                    <Box
                        sx={{
                            width: '50%',
                            opacity: selectedOmic == 'q' ? 1 : 0,
                            transition: 'all ease 0.5s'
                        }}
                    >
                        <MainContent omic='q' thrLRef={thrLRef} />
                    </Box>
                    <Box
                        sx={{
                            width: '50%',
                            opacity: selectedOmic == 'm' ? 1 : 0,
                            transition: 'all ease 0.5s'
                        }}
                    >
                        <MainContent omic='m' thrLRef={thrLRef} />
                    </Box>
                </Box>
            </Box>
        </Dialog >
    )
}

export default ExploreFeaturesContainer