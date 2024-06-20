import { Autocomplete, Box, Button, Card, CardContent, CardHeader, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import SelectColumns from './SelectColumns';
import { Divider } from '@mui/material';
import CMMParams from './CMMParams';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import TPPSection from './TPPSection';
import { DEFAULT_NEGATIVE_DATA, DEFAULT_POSITIVE_DATA_NH4 } from './TPPSection'
import AnnotateButton from './AnnotateButton';
import { useDispatchJob, useJob } from '@/components/app/JobContext';
import { useVars } from '@/components/VarsContext';


function AnnotationsParamsContent({ setPage, setCreatingJob, setAnnotating }) {

    const { API_URL } = useVars();
    const { jobID } = useJob();

    const dispatchJob = useDispatchJob();

    const [annParams, setAnnParams] = useState({
        mzCol: null,//{ label: 'Apex m/z', id: 'Apex m/z' },
        rtCol: null,//{ label: 'RT [min]', id: 'RT [min]' },
        ionCol: null,//{ label: 'Mode', id: 'Mode' },
        ionValPos: null,//{ label: 'POS', id: 'POS' },
        ionValNeg: null,//{ label: 'NEG', id: 'NEG' },
        mzError: 5,
        posAdd: ["M+H", "M+2H", "M+Na", "M+K", "M+H-H2O", "M+H+HCOONa", "M+NH4"],
        negAdd: ["M-H", "M-2H", "M-H+HCOONa", "M+Na-2H", "M+Cl", "M-H-H2O"],
        mRtWPos: 0.1,
        lRtWPos: 2,
        mRtWNeg: 0.1,
        lRtWNeg: 2,
        lipidAddPos: DEFAULT_POSITIVE_DATA_NH4,
        lipidAddNeg: DEFAULT_NEGATIVE_DATA,
        status: 'waiting'
    });

    const onAnnotate = () => {

        if (
            !(annParams.mzError > 0) ||
            !(annParams.mRtWPos > 0) ||
            !(annParams.lRtWPos > 0) ||
            !(annParams.mRtWNeg > 0) ||
            !(annParams.lRtWNeg > 0)
        ) {
            window.alert('Error! Please check number fields');
            return;
        }

        fetch(`${API_URL}/post_ann_params/${jobID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annParams)
        });

        dispatchJob({ type: 'set-ann-params', annParams: annParams });
        setAnnotating(true);
        setCreatingJob('');
        setPage('results');
    }

    return (
        <Box>
            <AnnotateButton
                showButton={
                    annParams.mzCol &&
                    annParams.rtCol &&
                    annParams.ionCol &&
                    (
                        (annParams.ionValPos && annParams.posAdd.length > 0) ||
                        (annParams.ionValNeg && annParams.negAdd.length > 0)
                    )
                }
                onAnnotate={onAnnotate}
            />
            <Box sx={{ mt: 2 }}>
                <SelectColumns annParams={annParams} setAnnParams={setAnnParams} />
                <Divider sx={{ mt: 4, mb: 4 }}>PUTATIVE ANNOTATIONS PARAMETERS (CMM)</Divider>
                <CMMParams annParams={annParams} setAnnParams={setAnnParams} />
                <Divider sx={{ mt: 4, mb: 4 }}>TURBOPUTATIVE PARAMETERS (TPMetrics)</Divider>
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Box sx={{ width: '45%' }}>
                        <TPPSection
                            name='Mode Positive'
                            attr='Pos'
                            annParams={annParams}
                            setAnnParams={setAnnParams}
                        />
                    </Box>
                    <Box sx={{ width: '0%', borderLeft: '1px solid rgba(0,0,0,0.1)' }}></Box>
                    <Box sx={{ width: '45%' }}>
                        <TPPSection
                            name='Mode Negative'
                            attr='Neg'
                            annParams={annParams}
                            setAnnParams={setAnnParams}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default AnnotationsParamsContent