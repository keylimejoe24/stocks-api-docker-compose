import { StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ScrapeProgressProvider from "./ScrapeProgressProvider";

ReactDOM.render(
  <React.StrictMode>
   <StyledEngineProvider injectFirst>
    <ScrapeProgressProvider>
      <App />
    </ScrapeProgressProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
