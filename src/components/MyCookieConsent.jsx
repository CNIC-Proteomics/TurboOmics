import React from 'react'
import CookieConsent, { resetCookieConsentValue } from "react-cookie-consent";

function MyCookieConsent() {
    resetCookieConsentValue("CookieConsent");
    return (
        <CookieConsent
            location="bottom"
            buttonText="OK"
            cookieName="CookieConsent"
            style={{ background: "#2B373B", opacity:1, transition:'all ease 1s' }}
            buttonStyle={{ color: "#ffffff", backgroundColor: 'rgba(255,50,50,0.5)', fontSize: "13px", borderRadius: '3px' }}
            expires={150}
        >
            This website uses only essential cookies required for its core functionality. No analytics or marketing cookies are used.
        </CookieConsent>
    )
}

export default MyCookieConsent