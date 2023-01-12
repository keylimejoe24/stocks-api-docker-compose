// import * as React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
import { StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { SocketProvider } from './SocketProvider';
ReactDOM.render(
  <React.StrictMode>
   <StyledEngineProvider injectFirst>
   <App />
   {/* <SocketProvider>
  
   </SocketProvider> */}
    </StyledEngineProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();

// ReactDOM.createRoot(document.querySelector("#root")).render(
//   <React.StrictMode>
   
//   </React.StrictMode>
// );