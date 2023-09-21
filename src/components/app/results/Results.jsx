import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function Results() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box
            sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: "80vh" }}
        >
            <Tabs
                orientation="vertical"
                //variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: 'divider', width:'15%' }}
            >
                <Tab label="EXPLORATORY DATA ANALYSIS" {...a11yProps(0)} sx={{mt:2}} />
                <Tab label="MULTIOMICS FACTOR ANALYSIS" {...a11yProps(1)} sx={{mt:2}} />
                <Tab label="COMMUNITY ANALYSIS" {...a11yProps(2)} sx={{mt:2}} />
                <Tab label="REGULARIZED CANONICAL CORRELATION ANALYSIS" {...a11yProps(3)} sx={{mt:2}} />
                <Tab label="DIFFERENTIAL CORRELATION ANALYSIS" {...a11yProps(4)} sx={{mt:2}} />
                <Tab label="ELASTIC NET" {...a11yProps(5)} sx={{mt:2}} />
            </Tabs>
            <TabPanel value={value} index={0}>
                Item One
            </TabPanel>
            <TabPanel value={value} index={1}>
                Item Two
            </TabPanel>
            <TabPanel value={value} index={2}>
                Item Three
            </TabPanel>
            <TabPanel value={value} index={3}>
                Item Four
            </TabPanel>
            <TabPanel value={value} index={4}>
                Item Five
            </TabPanel>
            <TabPanel value={value} index={5}>
                Item Six
            </TabPanel>
        </Box>
    );
}

/*
export default function Results() {

    const [value, setValue] = useState(0);
    const job = useJob();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box>
            <Tabs value={value} onChange={handleChange} aria-label="disabled tabs example">
                <Tab label="EXPLORATORY ANALYSIS" />
                <Tab label="MULTIOMICS FACTOR ANALYSIS" />
                <Tab label="COMMUNITY ANALYSIS" />
                <Tab label="REG-CANONICAL CORRELATION ANALYSIS" />
                <Tab label="DIFFERENTIAL CORRELATION ANALYSIS" />
                <Tab label="ELASTIC NET" />
            </Tabs>
        </Box>
    )
}
*/