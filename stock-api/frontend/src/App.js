import './App.css';
import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ScrapeList from './ScrapeList';
import AlgorithmsList from './AlgorithmsList';
import TestResultsList from './TestResultsList';
import TickerList from './TickerList';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import CurrencyInput from './CurrencyInput';
import socketIOConfig from '../socket_io_config.json';


const sockets = []
socketIOConfig.map(url => {
  const newSocket = socketIO.connect(url);
  sockets.push(newSocket)
})

const MASTER_IP = "54.146.237.10"
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fafafa',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  margin: theme.spacing(4),
  textAlign: 'center',
  height: "auto",
  color: theme.palette.text.secondary,
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));


export default function App() {
  const [scrapeIdSelected, setScrapeIdSelected] = React.useState("");
  const [scrapeIds, setScrapeIds] = React.useState([]);
  const [algorithmsResponse, setAlgorithmsResponse] = useState(null);
  const [tickersResponse, setTickersResponse] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const testResultsClickHandler = ticker => {

    let testRes = _.find(algorithmsResponse.totalResults, ['ticker', ticker]);
    let formattedTestRes = []

    for (const [key, value] of Object.entries(testRes.value)) {
      console.log(key)
      formattedTestRes.push({ [`${key}`]: value })
    }

    setTestResults(formattedTestRes)

  };

  const onChangeHandler = event => {
    console.log(event)
    // setInputValue(event.target.value);
  };
  const onScrapIdClickedHandler = id => {
    setScrapeIdSelected(id);
  };
  const formatAlgorithmsResponse = response => {
    console.log(response)
    let totalResults = []
    for (const [key, value] of Object.entries(response.totalResults)) {
      totalResults.push({ ticker: key, weight: value["Total Weight"], value: value })
    }
    totalResults.sort((a, b) => a.ticker.localeCompare(b.ticker))
    return {
      ...response, totalResults: totalResults
    }

  }

  const deleteOnClickHandler = id => {

    const deleteScrapeRequestOptions = {
      method: 'DELETE'
    };

    fetch(`http://${MASTER_IP}:5000/api/v1/scrape_start/${id}`, deleteScrapeRequestOptions)

      .then(response => {

        fetch(`http://${MASTER_IP}:5000/api/v1/scrape_starts`, { method: "GET" })
          .then(res => res.json())
          .then(response => {
            console.log(response)
            setScrapeIds(response)
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));

  }
  const runAlgorithmsClickHandler = event => {
    fetch(`http://${MASTER_IP}:3001/api/algorithms/run/${scrapeIdSelected}`, { method: 'GET' })
      .then(res => res.json())
      .then(response => {
        let formattedRes = formatAlgorithmsResponse(response)
        setAlgorithmsResponse(formattedRes)
      })
      .catch(error => console.log(error));

  }
  const scrapeStartClickHandler = event => {
    let newScrapeId = uuidv4()

    const scrapeStartrequestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newScrapeId })
    };
    const scrapeRequestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scrapeID: newScrapeId })
    };

    fetch(`http://${MASTER_IP}:5000/api/v1/scrape_starts`, scrapeStartrequestOptions)
      .then(res => res.json())
      .then(response => {
        fetch(`http://${MASTER_IP}:5000/api/v1/scrape_starts`, { method: "GET" })
          .then(res => res.json())
          .then(response => {
            console.log(response)
            setScrapeIds(response)
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));

    fetch(`http://${MASTER_IP}:5000/api/v1/run_scrape`, scrapeRequestOptions)
      .then(res => res.json())
      .then(response => {
        console.log(response)
      })
      .catch(error => console.log(error));
  };


  useEffect(() => {
    fetch(`http://${MASTER_IP}:5000/api/v1/scrape_starts`, { method: "GET" })
      .then(res => res.json())
      .then(response => {
        console.log(response)
        setScrapeIds(response)
      })
      .catch(error => console.log(error));

    fetch(`http://${MASTER_IP}:3001/api/scrape/tickers`, { method: "GET" })
      .then(res => res.json())
      .then(response => {
        console.log(response)
        setTickersResponse(response)
      })
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    const sortedScrapeIds = scrapeIds.sort((a, b) => a.createdAt - b.createdAt)
    setScrapeIds(sortedScrapeIds)

  }, [scrapeIds]);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>

        <Grid container spacing={2}>

          <Grid xs={4}>
            <Item>
            <span style={{ minWidth: 300 }}>{tickersResponse && <TickerList maxWidth={500} scrapeStartClickHandler={scrapeStartClickHandler} testResultsClickHandler={testResultsClickHandler} title={"Tickers to Scrape"} results={tickersResponse} />}</span>

             
              {/* <span style={{ minWidth: 500 }}>{testResults && <TestResultsList maxWidth={450} testResultsClickHandler={testResultsClickHandler} title={"Test Results"} results={testResults} />}</span> */}


            </Item>
            <Item>
              <Stack direction="row">
                <StyledInput
                  fullWidth
                  inputProps={{ style: { fontSize: 10 } }} // font size of input text
                  InputLabelProps={{ style: { fontSize: 10 } }} // font size of input label
                  disabled={scrapeIdSelected === ""} size={'small'} value={scrapeIdSelected} onChange={onChangeHandler} id="outlined-basic" label="Scrape ID" variant="outlined" />              </Stack>

              <Stack direction="row">
                <StyledButton sx={{ fontSize: 10 }} disabled={scrapeIdSelected === ""} color="warning" size={'small'} onClick={() => { setScrapeIdSelected("") }} variant="outlined">Clear Selection</StyledButton>
                <StyledButton sx={{ fontSize: 10 }} disabled={scrapeIdSelected === ""} size={'small'} onClick={runAlgorithmsClickHandler} variant="outlined">Run Algorithms</StyledButton>
              </Stack>

              <ScrapeList maxWidth={500} onClickHandler={onScrapIdClickedHandler} deleteOnClickHandler={deleteOnClickHandler} ids={scrapeIds} />
            </Item>
          </Grid>
          <Grid xs={8}>
            <Item align={"left"} style={{ display: "flex", gap: "1rem", alignItems: "center", maxHeight: 700 }}>
              <span style={{ minWidth: 100 }}>{algorithmsResponse && <AlgorithmsList maxWidth={100} testResultsClickHandler={testResultsClickHandler} title={"Top Ten"} results={algorithmsResponse.topTen} />}</span>
              <span style={{ minWidth: 100 }}>{algorithmsResponse && <AlgorithmsList maxWidth={100} testResultsClickHandler={testResultsClickHandler} title={"Bottom Ten"} results={algorithmsResponse.bottomTen} />}</span>
              <span style={{ minWidth: 100 }}>{algorithmsResponse && <AlgorithmsList maxWidth={100} testResultsClickHandler={testResultsClickHandler} title={"Total Results"} results={algorithmsResponse.totalResults} />}</span>
              <span style={{ minWidth: 500 }}>{testResults && <TestResultsList maxWidth={450} testResultsClickHandler={testResultsClickHandler} title={"Test Results"} results={testResults} />}</span>


            </Item>


          </Grid>

        </Grid>

      </Box>

    </div>




  );
}

{/* <Box sx={{ flexGrow: 1 }}>
<Grid container spacing={2}>
  <Grid xs={8}>
    <Item>xs=8</Item>
  </Grid>
  <Grid xs={4}>
    <Item>xs=4</Item>
  </Grid>
  <Grid xs={4}>
    <Item>xs=4</Item>
  </Grid>
  <Grid xs={8}>
    <Item>xs=8</Item>
  </Grid>
</Grid>
<NestedGrid />
</Box> */}


// function App() {


//   return (
//     <div className="App">
//     <NestedGrid />
//     </div>
//   );
// }

// export default App;
