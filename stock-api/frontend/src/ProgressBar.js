import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect,useRef,useHasChanged} from "react";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function CircularProgressWithLabel({ completedTickers, filteredTickers,currentScrapeId,averageScrapeTime }) {

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (completedTickers.length > 0) {
      let completedRatio = Math.min(completedTickers.length / filteredTickers.length)  * 100
      console.log(completedRatio)
      setProgress(completedRatio)
    }else if(completedTickers.length === filteredTickers.length){
      setProgress(100)
    }
  }, [completedTickers, filteredTickers]);
  console.log(averageScrapeTime)
  return (
    <Box sx={{ width: '100%' }}>
      <div>Running New Scrape </div>
      <span style={{ fontSize: 12, fontWeight: "bold" }}>{"Scrape ID: "}</span><span style={{ fontSize: 10 }}>{currentScrapeId}</span>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
        <Typography variant="body2" color="text.secondary">{`avg scrape time ${averageScrapeTime} ticker/s`}</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            progress,
          )}%`}</Typography>
        </Box>
      </Box>
    </Box>
    // <Box sx={{ width: '100%',height:"40px" }}>
    //   <span style={{ fontSize: 10, fontWeight: "bold" }}>Running Scrape </span> 
    //   <LinearProgress variant="determinate" value={progress} />
    // </Box>

  );
}
