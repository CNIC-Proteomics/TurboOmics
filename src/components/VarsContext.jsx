"use client"

import React, { createContext, useContext } from 'react';

const VarsContext = createContext({
    BASE_URL:'/turboputative',
    API_URL: 'http://localhost:8080/turboputative/api/tbomics'
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