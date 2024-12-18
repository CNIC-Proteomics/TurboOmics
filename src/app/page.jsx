"use client"

import { StrictMode } from "react";

import { VarsProvider } from "../components/VarsContext";
import MyNavBar from "../components/NavBar";
import App from "../components/app/App";

import MyCookieConsent from "../components/MyCookieConsent";

//import { CacheProvider } from "@emotion/react";
//import createCache from "@emotion/cache";

export default function Page() {
    // remove chache provider after Chrome 129 bug disappears
    //const cache = createCache({ key: "sarink", speedy: false }) 
    // https://emotion.sh/docs/cache-provider
    
    return (
        <main>
            <StrictMode>
                <VarsProvider>
                    <MyNavBar />
                    <App />
                    <MyCookieConsent/>
                </VarsProvider>
            </StrictMode>
        </main>
    )
}
