"use client"

import { StrictMode } from "react";

import { VarsProvider } from "../components/VarsContext";
import MyNavBar from "../components/NavBar";
import App from "../components/app/App";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

export default function Page() {
    // remove chache provider after Chrome 129 bug disappears
    const cache = createCache({ key: "sarink", speedy: false })
    return (
        <main>
            <CacheProvider value={cache}>
                <StrictMode>
                    <VarsProvider>
                        <MyNavBar />
                        <App />
                    </VarsProvider>
                </StrictMode>
            </CacheProvider>
        </main>
    )
}
