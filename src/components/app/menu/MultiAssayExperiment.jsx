import React, { useRef, useState } from 'react';

import { useDispatchJob, useJob } from '../JobContext';
import { Backdrop, Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Link, List, ListItem, Typography } from '@mui/material';
import { getStyle } from './getStyle';
import { useVars } from '@/components/VarsContext';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FileUploader } from 'react-drag-drop-files';
import { tsvToDanfo } from "../../../utils/tsvToDanfo.js";


const MultiAssayExperiment = () => {

    // global var
    const { BASE_URL, API_URL } = useVars();
    const dispatchJob = useDispatchJob();

    // component var
    const backgroundColor = 'rgba(0,0,0,0)';
    const style = getStyle(backgroundColor, false);

    // states
    const [openDialog, setOpenDialog] = useState(false);
    const [maeFile, setMaeFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Handle close of dialog
    const handleClose = () => {
        setOpenDialog(false);
        setMaeFile(null);
    }

    // Handle file upload by user
    const handleChange = (file) => {
        setMaeFile(file);
    }

    // Get data
    const getDataRef = useRef();
    const getData = async (maeid) => {
        const res = await fetch(`${API_URL}/get_multi_assay_experiment/${maeid}`);
        const resJson = await res.json();
        console.log(resJson);

        if (resJson.status.status == 'ok') {
            clearInterval(getDataRef.current);
            await new Promise(r => Promise.all(
                Object.keys(resJson.fileStr).map(key => new Promise(async r => {
                    let [dfJson, idCol] = await tsvToDanfo(resJson.fileStr[key], '\t', key[0] == 'x');
                    dispatchJob({
                        type: 'user-upload',
                        fileType: key,
                        userFileName: `${key}.tsv`,
                        dfJson: dfJson,
                        idCol: idCol
                    });
                    r(0)
                }))
            ).then(() => r(0)));
            setLoading(false);
            handleClose();
        }

        if (resJson.status.status == 'error') {
            clearInterval(getDataRef.current);
            setLoading(false);
            alert("Error extracting MultiAssayExperiment object")
        }
    }

    // Handle send data
    const sendData = async () => {
        const maeid = new Date().getTime();
        const formData = new FormData();
        formData.append('my_file', maeFile);
        const res = await fetch(
            `${API_URL}/extract_multi_assay_experiment/${maeid}`,
            {
                method: 'POST',
                body: formData
            }
        );
        const resJson = await res.json();
        if (resJson.status == 'ok') {
            clearInterval(getDataRef.current);
            setLoading(true);
            getDataRef.current = setInterval(() => getData(maeid), 5000);
        } else {
            console.log('error');
        }
    }

    return (<>
        <Box sx={{ width: 0, position: 'relative', left: -230 }}>
            <Card
                sx={{
                    ...style,
                    width: 200,
                    transition: "transform 0.15s ease-in-out, background 0.15s",
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)', transform: "scale3d(1.02, 1.02, 1)" }
                }}
                onClick={() => setOpenDialog(true)}
            >
                <Box sx={{ pt: 1 }}>
                    <img width={30} src={`${BASE_URL}/R.ico`} style={{ opacity: 0.7 }} alt="R" />
                </Box>
                <Box>
                    <Typography gutterBottom variant="h7" component="div">MultiAssayExperiment</Typography>
                </Box>
            </Card>
        </Box>
        <Dialog
            open={openDialog}
            onClose={handleClose}
            aria-labelledby="mydialog"
            maxWidth='lg'
            fullWidth={true}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="mydialog">
                Upload MultiAssayExperiment Object
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ textAlign: 'justify' }} dividers>
                <Typography gutterBottom>
                    Users can upload a <strong>.RDS</strong> file containing a <strong>MultiAssayExperiment</strong> object. This data structure is designed to facilitate the analysis and integration of multi-omics experiments, where multiple types of molecular observations (e.g., RNA and protein abundance) are collected from the same biological specimens.
                </Typography>
                <Typography>
                    The uploaded MultiAssayExperiment object must meet the following criteria:
                </Typography>
                <Box sx={{ pl: 3 }}>
                    <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                        <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                            The <code>colData</code> slot should contain metadata describing the primary biological units involved in your study.
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                            The <code>ExperimentList</code> slot should contain a list of ID-based elements where each element is a <code>SummarizedExperiment::SummarizedExperiment</code> object representing a specific omic type. The <strong>IDs</strong> in this list must be <strong>Proteomics</strong>, <strong>Transcriptomics</strong>, and/or <strong>Metabolomics</strong>, depending on the types of omic data included. These identifiers allow the TurboOmics platform to correctly interpret and process the uploaded data.
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                            Each <code>SummarizedExperiment</code> object in the <code>ExperimentList</code> must adhere to the following structure:
                            <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                    The <code>assay</code> slot should contain the quantitative data matrix,
                                </ListItem>
                                <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                    The <code>rowData</code> slot should contain additional metadata for each biomolecule, such as names, descriptions, and database identifiers.
                                </ListItem>
                            </List>
                        </ListItem>
                    </List>
                </Box>
                <Typography>
                    Please, find more information in <Link target='_blank' href='https://bioconductor.org/packages/release/bioc/vignettes/MultiAssayExperiment/inst/doc/MultiAssayExperiment.html'>MultiAssayExperiment</Link> and <Link target='_blank' href="https://bioconductor.org/packages/release/bioc/vignettes/SummarizedExperiment/inst/doc/SummarizedExperiment.html">SummarizedExperiment</Link> vignettes.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, py:2, borderTop:'1px solid rgba(0,0,0,0.2)', borderBottom:'1px solid rgba(0,0,0,0.2)' }}>
                    <Card sx={{ px: 5, pb: 2, pt: 0 }}>
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography sx={{ fontSize: '1.2em' }} >
                                MultiAssayExperiment Object
                            </Typography>
                        </Box>
                        <FileUploader
                            multiple={false}
                            handleChange={handleChange}
                            types={['RDS']}
                            name="MultiAssayExperiment"
                        />
                        <Typography sx={{ textAlign: 'center', pt: 2 }}>{maeFile ? maeFile.name : 'no file uploaded yet'}</Typography>
                    </Card>
                </Box>
                <Typography>
                    [1] Ramos M, et al. Software for the Integration of Multiomics Experiments in Bioconductor. Cancer Res. 2017 Nov 1;77(21):e39-e42. doi: 10.1158/0008-5472.CAN-17-0344. PMID: 29092936; PMCID: PMC5679241.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Box sx={{ margin: 'auto' }}>
                    <Button onClick={sendData} disabled={!maeFile}>
                        Upload Data
                    </Button>
                </Box>
            </DialogActions>
            <Box>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress color="inherit" />
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>Loading MultiAssayExperiment object...</Box>
                    </Box>
                </Backdrop>
            </Box>
        </Dialog>
    </>)
}

export default MultiAssayExperiment