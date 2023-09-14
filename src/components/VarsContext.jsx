"use client"

import React, { createContext, useContext } from 'react';

const VarsContext = createContext({
    BASE_URL:'/TurboPutative',
    API_URL: 'https://proteomics.cnic.es/TurboPutative/api/tbomics'
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