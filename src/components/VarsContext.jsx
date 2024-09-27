import React, { createContext, useContext } from 'react';

const DEV_MODE = true;

const VarsContext = createContext({
    DEV_MODE: DEV_MODE,
    BASE_URL: '/TurboPutative',
    SERVER_URL: DEV_MODE ? 'http://localhost:8080/TurboPutative' :
        'https://proteomics.cnic.es/TurboPutative',
    API_URL: DEV_MODE ? 'http://localhost:8080/TurboPutative/api/tbomics' :
        'https://proteomics.cnic.es/TurboPutative/api/tbomics',
    FETCH_CMM_URL: DEV_MODE ? 
    ['http://localhost:8080/TurboPutative/api/tbomics/get_cmm'] ://['http://localhost:8000/get_cmm'] :
        [
            'https://truboomics.alwaysdata.net/get_cmm',//turboputative@gmail.com
            'https://turboomicstercero.alwaysdata.net/get_cmm'//turboomicstercero@gmail.com
        ],
    OMIC2NAME: {
        'q': 'Proteomics',
        'm': 'Metabolomics',
        't': 'Transcriptomics'
    }
});

export function VarsProvider({ children }) {
    const vars = useVars();

    return (
        <VarsContext.Provider value={vars}>
            {children}
        </VarsContext.Provider>
    )
}

export function useVars() {
    return useContext(VarsContext);
}