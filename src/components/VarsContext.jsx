import React, { createContext, useContext } from 'react';

const DEV_MODE = true;

const VarsContext = createContext({
    DEV_MODE: DEV_MODE,
    BASE_URL: '/TurboPutative',
    API_URL: DEV_MODE ? 'http://localhost:8080/TurboPutative/api/tbomics' :
        'https://proteomics.cnic.es/TurboPutative/api/tbomics'
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