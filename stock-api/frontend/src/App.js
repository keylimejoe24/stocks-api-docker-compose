import './App.css';
import React, { useState, useEffect, useContext } from "react";
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
import socketIO from "socket.io-client";
import socketIOConfig from './socket_io_config.json';
import { ScrapeProgressContext } from "./ScrapeProgressProvider";

const sockets = []
const scrape_urls = []

socketIOConfig.map(url => {
  scrape_urls.push(`http://${url}/api/scrape/run`)
  // const newSocket = socketIO.connect(url);

  // sockets.push(newSocket)
})
const MASTER_IP = "3.83.232.168"
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

  const { currentScrapeId, setCurrentScrapeId, completedTickers, setCompletedTickers, currentlyCompletedTickers, setCurrentlyCompletedTickers } = useContext(ScrapeProgressContext);

  const [scrapeIdSelected, setScrapeIdSelected] = React.useState("");
  const [scrapeIds, setScrapeIds] = React.useState([]);
  const [algorithmsResponse, setAlgorithmsResponse] = useState(null);
  const [tickersResponse, setTickersResponse] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [tickerFilter, setTickerFilter] = React.useState("");
  
  const [marketCapFilter, setMarketCapFilter] = React.useState("500000000");
  const [filteredTickers, setFilteredTickers] = React.useState([]);
  const [scrapeTime, setScrapeTime] = React.useState(0);
  const [averageScrapeTime, setAverageScrapeTime] = React.useState(0);

  // useEffect(() => {
  //   sockets.map(socket => {
  //     socket.on("batchFinished", (data) => {
  //       setScrapeTime(data.scrapeTime)
  //       setCurrentlyCompletedTickers([...data.finishedTickers])
  //     });
  //     socket.on("complete", (data) => {
  //       console.log("complete")
  //       setCurrentScrapeId(null)
  //       setCurrentlyCompletedTickers([])
  //       setCompletedTickers([])
  //     });
  //     return () => {
  //       socket.off('connect');
  //       socket.off('batchFinished');
  //     };
  //   })

  // }, []);

  useEffect(() => {
    setCompletedTickers([...completedTickers, ...currentlyCompletedTickers]);
  }, [currentlyCompletedTickers]);


  useEffect(() => {
    if(completedTickers.length != 0){
      let summedScrapeTimes = parseFloat(scrapeTime + averageScrapeTime).toFixed(2)
      let averageScapeTime = parseFloat( summedScrapeTimes / completedTickers.length).toFixed(2)
      if(!_.isNaN(averageScapeTime)){
        setAverageScrapeTime(averageScapeTime)
      }
    }
  }, [scrapeTime]);




  const testResultsClickHandler = ticker => {

    let testRes = _.find(algorithmsResponse.totalResults, ['ticker', ticker]);
    let formattedTestRes = []
    for (const [key, value] of Object.entries(testRes.value)) {
      if(key === "Total Weight"){ 
        formattedTestRes.push({ [`[ ${ticker} ] ${key}`]: value })
      }else{
        formattedTestRes.push({ [`${key}`]: value })
      }
      
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
   
    let totalResults = []
    for (const [key, value] of Object.entries(response.totalResults)) {
      totalResults.push({ ticker: key, weight: value["Total Weight"], value: value }) 
    }
    let sorted = totalResults.sort((a, b) => a.ticker.localeCompare(b.ticker))
    
    return {
      ...response, totalResults: sorted
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
        console.log(response)
        let formattedRes = formatAlgorithmsResponse(response)
        
        setAlgorithmsResponse(formattedRes)
      })
      .catch(error => console.log(error));

  }




  useEffect(() => {
    fetch(`http://${MASTER_IP}:5000/api/v1/scrape_starts`, { method: "GET" })
      .then(res => res.json())
      .then(response => {
        console.log(response)
        setScrapeIds(response)
      })
      .catch(error => console.log(error));

    fetch(`http://${MASTER_IP}:3001/api/algorithms/tickers`, { method: "GET" })
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

  function splitToChunks(array, parts) {
    let result = [];
    for (let i = parts; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
  }

  const scrapeStartClickHandler = event => {
    let newScrapeId = uuidv4()

    const scrapeStartrequestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newScrapeId, ticker_count: filteredTickers.length })
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

    let filteredTickerSymbols = filteredTickers.map(a => a.symbol);

    let filteredTickerSymbolChunks = splitToChunks([...filteredTickerSymbols], scrape_urls.length);
    
    scrape_urls.map((url, index) => {
      const scrapeRequestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrapeID: newScrapeId, tickers: filteredTickerSymbolChunks[index] })
      };

      fetch(url, scrapeRequestOptions)
        .then(res => res.json())
        .then(response => {
          console.log(response)
        })
        .catch(error => console.log(error));

    })
    setCurrentScrapeId(newScrapeId)
  };



  return (


    <div>
      <Box sx={{ flexGrow: 1 }}>

        <Grid container spacing={2}>

          <Grid xs={4}>
            <Item>
              <span style={{ minWidth: 300 }}>{tickersResponse && <TickerList
                averageScrapeTime={averageScrapeTime}
                currentScrapeId={currentScrapeId}
                tickerFilter={tickerFilter}
                setTickerFilter={setTickerFilter}
                marketCapFilter={marketCapFilter}
                setMarketCapFilter={setMarketCapFilter}
                filteredTickers={filteredTickers}
                setFilteredTickers={setFilteredTickers}
                maxWidth={500} scrapeStartClickHandler={scrapeStartClickHandler}
                testResultsClickHandler={testResultsClickHandler}
                title={"Tickers to Scrape"}
                results={tickersResponse}
                completedTickers={completedTickers} />}</span>


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
              <span style={{ minWidth: 100 }}>{algorithmsResponse && <AlgorithmsList height={600} withFilter={false} maxWidth={100} testResultsClickHandler={testResultsClickHandler} title={"Top Ten"} results={algorithmsResponse.topTen} />}</span>
              <span style={{ minWidth: 100 }}>{algorithmsResponse && <AlgorithmsList height={600} withFilter={false} maxWidth={100} testResultsClickHandler={testResultsClickHandler} title={"Bottom Ten"} results={algorithmsResponse.bottomTen} />}</span>
              <span style={{ minWidth: 300 }}>{algorithmsResponse && <AlgorithmsList height={530} withFilter={true} maxWidth={300} testResultsClickHandler={testResultsClickHandler} title={"Total Results"} results={algorithmsResponse.totalResults} />}</span>
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
