import './App.css';
import UrlInput from './Components/UrlInput';
import { ChakraProvider } from '@chakra-ui/react'


function App() {
  return (
    <ChakraProvider>
    <div className="App">
     <UrlInput />
    </div>
    </ChakraProvider>
  );
}

export default App;
