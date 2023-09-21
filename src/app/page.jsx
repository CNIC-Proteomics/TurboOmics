import { StrictMode } from "react";


import { VarsProvider } from "../components/VarsContext";
import  MyNavBar from "../components/NavBar";
import App from "../components/app/App";

global.BASE_URL = process.env.BASE_URL;

export default function Page() {


  return (
    <main>
    <StrictMode>
      <VarsProvider>
        <MyNavBar/>
        <App/>
      </VarsProvider>
    </StrictMode>
    </main>
    )
}
