import { useVars } from '@/components/VarsContext';
import { useJob } from '@/components/app/JobContext'
import { useResults } from '@/components/app/ResultsContext';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react'
import { MySelect } from '../../EDA/DataDistribution/MyFormComponents';

function GSEA({ f2MeanL, fSet }) {

    const BASE_URL = useVars().BASE_URL;
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const [groups, setGroups] = useState({
        g1: mdataColInfo.levels[0],
        g2: mdataColInfo.levels[1]
    });

    //console.log(f2MeanL, fSet)

    return (
        <Box sx={{ mt: 3 }}>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ mr: 2 }}><Typography variant='h6'>GSEA</Typography></Box>
                <Box sx={{ cursor: 'pointer' }} onClick={
                    () => window.open("https://www.gsea-msigdb.org/gsea/index.jsp", "_blank", "noreferrer")
                }>
                    <Image
                        src={`${BASE_URL}/GSEA_logo.gif`}
                        width={85}
                        height={30}
                        className="d-inline-block align-top"
                        alt="GSEA"
                    /></Box>
            </Box>
            <Box sx={{ height: 460 }}>
                <GroupsSelector
                    groups={groups}
                    setGroups={setGroups}
                    mdataColInfo={mdataColInfo}
                />
            </Box>
        </Box>
    )
}

const GroupsSelector = ({ groups, setGroups, mdataColInfo }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '20%' }}>
                <MySelect
                    options={mdataColInfo.levels.map(e => ({ label: e, value: e }))}
                    onChange={
                        e => setGroups(prev => ({ ...prev, g1: e.value }))
                    }
                    value={{ label: `${groups.g1}`, value: groups.g1 }}
                    label=''
                />
            </Box>
            <Box sx={{ mx: 2, pt: 3.5 }}><Typography variant='h6'>vs</Typography></Box>
            <Box sx={{ width: '20%' }}>
                <MySelect
                    options={mdataColInfo.levels.map(e => ({ label: e, value: e }))}
                    onChange={
                        e => setGroups(prev => ({ ...prev, g2: e.value }))
                    }
                    value={{ label: `${groups.g2}`, value: groups.g2 }}
                    label=''
                />
            </Box>
        </Box>
    )
}

export default GSEA