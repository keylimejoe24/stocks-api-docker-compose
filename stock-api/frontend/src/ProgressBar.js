import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect, useRef, useHasChanged } from "react";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@mui/material/Unstable_Grid2';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function CircularProgressWithLabel({ completedTickers, filteredTickers, currentScrapeId, averageScrapeTime }) {

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (completedTickers.length > 0) {
      let completedRatio = Math.min(completedTickers.length / filteredTickers.length) * 100
      setProgress(completedRatio)
    } else if (completedTickers.length === filteredTickers.length) {
      setProgress(100)
    }
  }, [completedTickers, filteredTickers]);

  return (
    <Box sx={{ width: '100%', boxShadow: 3, marginTop: "30px" }}>
      <Grid container spacing={2}>

        <Grid xs={12}>
          <span align={"left"} style={{ fontSize: 12, fontWeight: "bold" }}>{"Running New Scrape: "}</span><span style={{ fontSize: 10 }}>{currentScrapeId}</span>

        </Grid>
        {/* <Grid xs={2}>
          <IconButton align={"right"} >
            <CloseIcon />
          </IconButton>
        </Grid> */}
      </Grid>



      <Box sx={{ display: 'flex', alignItems: 'left' }}>
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


  );
}
