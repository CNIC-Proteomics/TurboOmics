import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Box, List, ListItem } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function HelpSectionParams() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box>
            <IconButton aria-label="question" size="large" onClick={handleClickOpen} >
                <HelpOutlineIcon fontSize="inherit" />
            </IconButton>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth='lg'
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Enrichment Analysis
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
                        This section enables you to perform Enrichment Analysis using the <strong>Gene Set
                            Enrichment Analysis (GSEA) </strong> [1]
                        algorithm on each omic dataset independently. You can switch between omics using the
                        navigator bar at the top of the page to explore results for different data types.
                    </Typography>
                    <Typography gutterBottom>
                        It must be specified the column in your omic metadata table that contains the biomolecule identifiers.
                        If you are working with <strong>untargeted metabolomics</strong> data, you can choose to perform enrichment analysis
                        using the <strong>Mummichog</strong> [2] algorithm. For this analysis, you need to provide the
                        following additional columns from your omic metadata table: Apex m/z, Retention Time (min), Ion Mode.
                    </Typography>
                    <Typography gutterBottom>
                    It must also be selected the <strong>metric used for the enrichment analysis</strong>. 
                    You can choose from various metrics calculated 
                    by TurboOmics, such as PCA components or MOFA factors. In addition, it must be
                    indicated the column from your experimental metadata table that contains the <strong>groups to be compared</strong>.
                    </Typography>

                </DialogContent>
                <DialogActions>
                    <Box sx={{ textAlign: 'justify', p: 2 }}>
                        <Typography gutterBottom>
                            [1] Subramanian A, Tamayo P, Mootha VK, Mukherjee S, Ebert BL, Gillette MA, Paulovich A, Pomeroy SL, Golub TR, Lander ES, Mesirov JP. Gene set enrichment analysis: a knowledge-based approach for interpreting genome-wide expression profiles. Proc Natl Acad Sci U S A. 2005 Oct 25;102(43):15545-50. doi: 10.1073/pnas.0506580102. Epub 2005 Sep 30. PMID: 16199517; PMCID: PMC1239896.
                        </Typography>
                        <Typography gutterBottom>
                            [2] Li S, Park Y, Duraisingham S, Strobel FH, Khan N, Soltow QA, Jones DP, Pulendran B. Predicting network activity from high throughput metabolomics. PLoS Comput Biol. 2013;9(7):e1003123. doi: 10.1371/journal.pcbi.1003123. Epub 2013 Jul 4. PMID: 23861661; PMCID: PMC3701697.
                        </Typography>
                    </Box>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}