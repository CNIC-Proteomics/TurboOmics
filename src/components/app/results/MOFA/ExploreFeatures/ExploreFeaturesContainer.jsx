import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import OmicSelector from './OmicSelector';
import TopBarDialog from './TopBarDialog';
import { Box } from '@mui/material';
import "@splidejs/splide/dist/css/splide.min.css"
import { useJob } from '@/components/app/JobContext';

/*import dynamic from 'next/dynamic';
const MainContent = dynamic(
    () => import('./MainContent')
)*/
import MainContent from './MainContent';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function ExploreFeaturesContainer({
    exploreF,
    setExploreF,
    Factor,
    mdataCol,
    thrLRef,
    setEFLoading
}) {

    const { omics } = useJob();

    const [selectedOmic, setSelectedOmic] = useState(omics[0]);
    const boxOmicRef = useRef(null);

    const scrollOmic = direction => {
        const container = boxOmicRef.current;
        const containerWidth = container.clientWidth
        container.scrollLeft = container.scrollLeft + direction * containerWidth;
    }

    useEffect(() => {
        setEFLoading(false)
    }, [setEFLoading]);

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
                    sx={{ display: 'flex', width: `${100 * omics.length}%` }}
                >
                    {
                        omics.map(omic => (
                            <Box
                                key={omic}
                                sx={{
                                    width: `${100 / omics.length}%`,
                                    opacity: selectedOmic == omic ? 1 : 0,
                                    transition: 'all ease 0.5s'
                                }}
                            >
                                {selectedOmic == omic &&
                                    <MainContent omic={omic} thrLRef={thrLRef[omic]} />
                                }
                            </Box>
                        ))
                    }
                </Box>
            </Box>
        </Dialog >
    )
}

export default ExploreFeaturesContainer