import { Box, IconButton } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

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
            <Box sx={{ width: 50, position: 'relative', top: 0, zIndex: 500 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={downloadScatter}
                    sx={{ opacity: 0.5 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
    )
}