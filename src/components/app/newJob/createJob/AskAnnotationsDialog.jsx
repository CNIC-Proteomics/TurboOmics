import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box, Button } from '@mui/material';


function AskAnnotationsDialog({ creatingJob, setCreatingJob, setPage }) {

    return (
        <Box>
            <Dialog
                open={creatingJob == 'ask-annotations'}
                //onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Obtain Putative Annotations from CMM & TurboPutative?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Metabolomic features will be annotated using <a target='_blank' href='http://ceumass.eps.uspceu.es/'>Ceu Mass Mediator</a> and simplified using <a target='_blank' href='https://proteomics.cnic.es/TurboPutative/webserver'>TurboPutative</a>.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{ margin: 'auto' }}
                        onClick={() => { setCreatingJob(''); setPage('results') }}
                    >
                        No
                    </Button>
                    <Box style={{ margin: 'auto', cursor: 'not-allowed' }} >
                        <Button
                            onClick={() => { setCreatingJob('annotations-params') }}
                        >
                            Yes
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default AskAnnotationsDialog