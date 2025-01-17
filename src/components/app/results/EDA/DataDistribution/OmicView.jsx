import { useVars } from '@/components/VarsContext'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Link, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';

import React, { useEffect, useState } from 'react'
import {downloadImageDensityPlot} from '@/utils/DownloadRechartComponent'//./downloadImage'
import PlotData from './PlotData'
import FilterFeatures from './FilterFeatures'
import { useJob } from '../../../JobContext';

import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter'

function OmicView({
    omic,
    figRef,
    showPlot,
    showNorm,
    updatePlot,
    groupby
}) {

    const [filteredID, setFilteredID] = useState();
    const { OMIC2NAME } = useVars();
    const job = useJob();

    const downloadXnorm = () => {

        const xiJson = danfo2RowColJson(job.norm[`x${omic}`].T);
        const rowNames = Object.keys(xiJson);
        const colNames = job.index[`x${omic}`];
        const text = [
            ['', ...colNames].join('\t'),
            ...rowNames.map(r => [r, ...colNames.map(c => xiJson[r][c])].join('\t'))
        ].join('\n');

        const file = new Blob([text], { type: 'text/plain' });
        var link = document.createElement("a");
        link.setAttribute('download', `Norm_${job.userFileNames[`x${omic}`]}`);
        link.style.display = 'none';
        link.href = window.URL.createObjectURL(file);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const [openVSNPlot, setOpenVSNPlot] = useState(false);

    return (
        <Box>
            <Box sx={{
                border: '0px solid red',
                height: 0, width: '50%',
                display: 'flex', justifyContent: 'center',
                position: 'relative', top: -10, py: 1
            }}
            >
                <Box sx={{ px: 2 }}>
                    <Button
                        sx={{ fontSize: 16, textTransform: 'none', color: 'rgba(0,0,0,0.6)' }}
                        startIcon={<DownloadIcon />}
                        color='info'
                        onClick={() => downloadXnorm()}
                    >
                        Download Normalized Data
                    </Button>
                </Box>
                {job.results.PRE.norm[`x${omic}`] == 'vsn' &&
                    <Box sx={{ px: 2 }}>
                        <Button
                            sx={{ fontSize: 16, textTransform: 'none', color: 'rgba(0,0,0,0.6)' }}
                            startIcon={<TimelineIcon />}
                            color='info'
                            onClick={() => setOpenVSNPlot(true)}
                        >
                            VSN-Quality Plot
                        </Button>
                        <VSNPlot openVSNPlot={openVSNPlot} setOpenVSNPlot={setOpenVSNPlot} omic={omic} />
                    </Box>
                }
            </Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'flex-start'
            }}>
                <Box sx={{ width: '45%', height: '600px', pt: 4 }}>
                    <Typography
                        variant='h6'
                        sx={{ textAlign: 'center', color: '#555555' }}
                    >
                        Data Distribution
                        <IconButton
                            aria-label="download"
                            size='small'
                            onClick={e => downloadImageDensityPlot(
                                figRef.current[omic]['Hist'],
                                figRef.current[omic]['Box'],
                                OMIC2NAME[omic]
                            )}
                            sx={{
                                opacity: 0.5,
                                visibility: showPlot[omic] ? 'visible' : 'hidden',
                                paddingBottom: 1
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Typography>
                    {showPlot[omic] ?
                        <Box sx={{ height: 500, overflow: 'hidden', mt: 3 }}>
                            <PlotData
                                omic={omic}
                                fileType={`x${omic}`}
                                filteredID={filteredID}
                                groupby={groupby}
                                showNorm={showNorm}
                                figRef={figRef}
                            />
                        </Box>
                        :
                        <Box sx={{ textAlign: 'center', pt: 20, height: 550 }}>
                            <CircularProgress size={100} thickness={2} />
                        </Box>
                    }
                </Box>
                <Box sx={{ width: '45%', height: '600px' }}>
                    <FilterFeatures
                        omic={omic}
                        setFilteredID={setFilteredID}
                        updatePlot={updatePlot}
                    />
                </Box>
            </Box>
        </Box>
    )
}

const VSNPlot = ({ openVSNPlot, setOpenVSNPlot, omic }) => {

    const { API_URL } = useVars();
    const job = useJob();
    const { jobID } = useJob();
    const [image, setImage] = useState(null);

    useEffect(() => {
        const fetchVSNImage = async () => {
            const res = await fetch(`${API_URL}/get_vsn_plot/${jobID}/${omic}`);
            const imageBlob = await res.blob();
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setImage(imageObjectURL);
        }
        const myTimeout = setTimeout(fetchVSNImage, 500);
        return () => clearTimeout(myTimeout);
    }, [setImage, API_URL, jobID, omic]);

    return (
        <Dialog
            open={openVSNPlot}
            onClose={() => setOpenVSNPlot(false)}
            fullWidth={true}
            maxWidth='md'
        >
            <DialogTitle>VSN-Quality Plot</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => setOpenVSNPlot(false)}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            ><CloseIcon /></IconButton>
            <DialogContent dividers>
                <Typography sx={{ textAlign: 'justify' }} gutterBottom>
                    The red dots, connected by lines, show the running median of the standard deviation. The aim of these plots is to see whether there is a systematic trend in the standard deviation of the data as a function of overall expression. After variance stabilisation, this should be approximately a horizontal line. It may have some random fluctuations, but should not show an overall trend. If this is not the case, that usually indicates a data quality problem, or is a consequence of inadequate prior data preprocessing.
                </Typography>
                <Box sx={{ textAlign: 'center', py:2 }}>
                    <img src={image} alt="VSN-Quality Plot" />
                </Box>
                <Typography sx={{ textAlign: 'justify' }} gutterBottom>
                    Please, find more information about VSN on <Link target='_blank' href="https://www.bioconductor.org/packages/release/bioc/vignettes/vsn/inst/doc/A-vsn.html">VSN vignette</Link>.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={() => {
                    var link = document.createElement("a");
                    link.setAttribute('download', `${job.userFileNames[`x${omic}`].replace(/\.[^.]+$/, '') + 'VSN_QualityPlot.png'}`);
                    link.style.display = 'none';
                    link.href = image;//window.URL.createObjectURL(file);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }}>
                    Download Plot
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default OmicView