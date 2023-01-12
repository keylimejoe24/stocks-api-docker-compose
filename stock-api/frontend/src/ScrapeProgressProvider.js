import React, { createContext, useReducer } from "react";


export const ScrapeProgressContext = createContext();

const ScrapeProgressProvider = ({ children }) => {
    const [currentScrapeId, setCurrentScrapeId] = React.useState(null);
    const [completedTickers, setCompletedTickers] = React.useState([]);
    const [currentlyCompletedTickers, setCurrentlyCompletedTickers] = React.useState([]);

    

  return (
    <ScrapeProgressContext.Provider value={{currentScrapeId, setCurrentScrapeId,completedTickers, setCompletedTickers,currentlyCompletedTickers, setCurrentlyCompletedTickers }}>
      {children}
    </ScrapeProgressContext.Provider>
  );
};

export default ScrapeProgressProvider;