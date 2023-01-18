import React, { createContext, useEffect } from "react";


export const ScrapeProgressContext = createContext();

const ScrapeProgressProvider = ({ children }) => {

    const [currentScrapeId, setCurrentScrapeId] = React.useState(null);
    const [completedTickers, setCompletedTickers] = React.useState([]);
    const [currentlyCompletedTickers, setCurrentlyCompletedTickers] = React.useState([]);

  //   useEffect(() => {
  //       console.log(currentlyCompletedTickers)
  //       console.log(completedTickers)
   
  // }, [currentlyCompletedTickers,completedTickers]);
    
  return (
    <ScrapeProgressContext.Provider value={{currentScrapeId, setCurrentScrapeId,completedTickers, setCompletedTickers,currentlyCompletedTickers, setCurrentlyCompletedTickers }}>
      {children}
    </ScrapeProgressContext.Provider>
  );
};

export default ScrapeProgressProvider;