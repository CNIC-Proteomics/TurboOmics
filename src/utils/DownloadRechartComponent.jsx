import { Box, IconButton } from "@mui/material";
import ImageIcon from '@mui/icons-material/Image';

import downloadSVG from "./downloadSVG";


export const DownloadComponent = ({ scatterRef, fileName }) => {
    const downloadScatter = () => {
        const scatterComp = scatterRef.current.container.cloneNode(true);
        const fullFig = window.document.createElement('div');
        fullFig.appendChild(scatterComp);
        downloadSVG(fullFig, fileName);
    }

    return (
        <Box sx={{ height: 0 }}>
            <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 500 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={downloadScatter}
                    sx={{ opacity: 0.5 }}
                >
                    <ImageIcon />
                </IconButton>
            </Box>
        </Box>
    )
}