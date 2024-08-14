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
                    Data Distribution
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
                <DialogContent sx={{textAlign: 'justify'}} dividers>
                    <Typography gutterBottom>
                        This section allows users to explore the distribution of quantitative values for 
                        biomolecules across different omic datasets (metabolomics, proteomics and 
                        transcriptomics). Users can navigate between different omics using the 
                        Omic Selector button at the top. Each omic subsection is divided into two main panes:
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                        <List sx={{listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', border: '0px solid red' }}>
                                <strong>Left Pane: Visualization</strong>
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item',  textAlign: 'justify' }}>
                                        <strong>Density Plot & Boxplot</strong>: Displays the distribution of quantitative values for                                        
                                        the selected biomolecules. The default view shows the overall distribution, but you can 
                                        customize this view using the Group by selector and the right pane filter.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item',  textAlign: 'justify' }}>
                                        <strong>Group by Selector</strong>: This button lets users choose a categorical variable from the 
                                         Experimental Metadata Table to group the data by. When a category is selected, the plot 
                                         will display separate 
                                        density curves for each group within that category. This feature is particularly useful for 
                                        detecting batch effects or other group-specific variations in your data.
                                    </ListItem>
                                </List>
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', border: '0px solid red' }}>
                                <strong>Right Pane: Biomolecule Filtering</strong>
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item',  textAlign: 'justify' }}>
                                        <strong>Biomolecule Table</strong>: This table lists the identifiers of biomolecules used in the 
                                        visualization on the left. It helps users track which biomolecules are currently being analyzed.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item',  textAlign: 'justify' }}>
                                        <strong>Filter by Omic-Metadata</strong>: Located above the table, this selector allows users to 
                                        filter the biomolecules based on a specific column from the Omic Metadata Table. 
                                        After selecting a filter, only the biomolecules that match the string criteria (regex are accepted) 
                                        will be displayed in the density plot.
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