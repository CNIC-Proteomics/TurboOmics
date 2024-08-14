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

export default function HelpSectionBottom() {
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
                    Pathway Analysis - Pathway Exploration
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
                        The structure of the lower pane varies based on whether you are
                        using Single-View or Multi-View analysis:
                    </Typography>
                    <Box sx={{ pl: 4 }}>
                        <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Single-View</strong>:
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Relevant Pathways Table</strong>:
                                        Displays the pathways most strongly associated
                                        with the outcome (only pathways with a VIP {'>'} 1 are shown).
                                        The VIP (Variable Importance in Projection) score highlights the
                                        importance of each pathway in the model.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Pathway Exploration</strong>: Clicking on a pathway allows
                                        you to explore the biomolecules associated with it. The association
                                        is indicated by the loading on the first principal component,
                                        which provides insight into the contribution of each biomolecule (the 
                                        loading sign should not be interpreted as a biological increase or decrease).
                                    </ListItem>
                                </List>
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Multi-View</strong>:
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Omic-Specific Pathway Tables</strong>:
                                        Separate tables are provided for each analyzed omic, listing the most relevant 
                                        pathways for each (VIP {'>'} 1). This allows you to see how pathways across 
                                        different omics contribute to the overall model.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Pathway Exploration</strong>: Similar to Single-View, you can click on pathways 
                                        to explore the associated biomolecules, with their degree of 
                                        association indicated by their loadings.
                                    </ListItem>
                                </List>
                            </ListItem>
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}