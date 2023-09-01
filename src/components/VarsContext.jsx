"use client"

import React, { createContext, useContext } from 'react';

const VarsContext = createContext({
    BASE_URL:'/turboputative'
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