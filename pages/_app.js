// CSS para toda la aplicación
import "../styles/style.css";
import { ChakraProvider } from '@chakra-ui/react'

// Codigo aqui estará presente en todas las páginas
const App = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default App;
