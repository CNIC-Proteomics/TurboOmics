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

export default function HelpSection() {
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
                    Multi-Omics Factor Analysis (MOFA) - Heatmap
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
                        This subsection visualizes the quantitative values of the biomolecules selected in the
                        Loading Plot Distribution section, providing a comprehensive overview of their expression
                        patterns across samples.
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                        <Typography gutterBottom><strong>Heatmap Representation:</strong></Typography>
                        <List sx={{ listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Columns</strong>: Each column represents a biomolecule from the selected omics,
                                showcasing their quantitative values.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Rows</strong>: Each row corresponds to a sample, grouped according to the metadata
                                variable selected at the top of the section.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Color Range Customization</strong>: The heatmap’s color range can be
                                adjusted using the legend at the bottom.
                            </ListItem>
                        </List>
                        <Typography gutterBottom>
                            Located at the bottom of the section, the Explore Features button allows for an in-depth exploration of the
                            biomolecules displayed in the heatmap. Clicking it will take you to a detailed analysis section,
                            where you can further investigate the selected biomolecules and delve into their biological significance.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ textAlign: 'justify', p: 2 }}>
                        <Typography gutterBottom>
                            [1] Argelaguet R, Velten B, Arnol D, Dietrich S, Zenz T, Marioni JC, Buettner F, Huber W, Stegle O. Multi-Omics Factor Analysis-a framework for unsupervised integration of multi-omics data sets. Mol Syst Biol. 2018 Jun 20;14(6):e8124. doi: 10.15252/msb.20178124. PMID: 29925568; PMCID: PMC6010767.
                        </Typography>
                    </Box>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}