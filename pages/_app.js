// CSS para toda la aplicación
import "../styles/style.css";
import Head from "next/head";
import { ChakraProvider } from '@chakra-ui/react'
import { CookiesProvider } from 'react-cookie'

// Codigo aqui estará presente en todas las páginas
const App = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Head>
          <link rel="icon" href="/favicon.png" />
      </Head>
      <CookiesProvider>
        <Component {...pageProps} />
      </CookiesProvider>
    </ChakraProvider>
  );
};

export default App;
