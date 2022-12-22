import './App.css';
import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ScrapeList from './ScrapeList';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';


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
  const [algorithmsResponse, setAlgorithmsResponse] = useState([]);

  const onChangeHandler = event => {
    console.log(event)
    // setInputValue(event.target.value);
  };
  const onScrapIdClickedHandler = id => {
    setScrapeIdSelected(id);
  };
  const runAlgorithmsClickHandler = event => {
    fetch(`http://${process.env.REACT_APP_MASTER_IP}:3001/api/algorithms/run/${scrapeIdSelected}`,{ method: 'GET'})
    .then(res => res.json())
    .then(response => {
      setAlgorithmsResponse(response)
    })
    .catch(error => console.log(error));
    
  }
  const scrapeStartClickHandler = event => {
    let newScrapeId =  uuidv4()

    const scrapeStartrequestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newScrapeId })
    };
    const scrapeRequestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scrapeID: newScrapeId})
    };
    
    fetch(`http://${process.env.REACT_APP_MASTER_IP}:5000/api/v1/scrape_starts`,scrapeStartrequestOptions)
    .then(res => res.json())
    .then(response => {
      setScrapeIds([...scrapeIds, ...[newScrapeId]])
    })
    .catch(error => console.log(error));

    fetch(`http://${process.env.REACT_APP_MASTER_IP}:5000/api/v1/run_scrape`,scrapeRequestOptions)
    .then(res => res.json())
    .then(response => {
      console.log(response)
    })
    .catch(error => console.log(error));
  };

  const PrettyPrintJson = ({ data }) => (<div align={"left"}><pre  align={"left"}>{JSON.stringify(data["totalResults"], null, 4)}</pre></div>);

//const sortedActivities = activities.sort((a, b) => b.date - a.date)

  useEffect(() => {
    fetch(`http://${process.env.REACT_APP_MASTER_IP}:5000/api/v1/scrape_starts`, { method: "GET" })
      .then(res => res.json())
      .then(response => {
        console.log(response)
        setScrapeIds(response)
      })
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    const sortedScrapeIds = scrapeIds.sort((a, b) =>  a.createdAt - b.createdAt)
    setScrapeIds(sortedScrapeIds)

  }, [scrapeIds]);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>

        <Grid container spacing={2}>

          <Grid xs={3}>
            <Item>

              <Stack direction="row">
                <StyledButton size={'small'} color="success" onClick={scrapeStartClickHandler} variant="outlined">Start Scrape</StyledButton>
              </Stack>

            </Item>
            <Item>
            <Stack direction="row">
            <StyledInput
                  fullWidth
                  inputProps={{ style: { fontSize: 10 } }} // font size of input text
                  InputLabelProps={{ style: { fontSize: 10 } }} // font size of input label
                   disabled={scrapeIdSelected === ""} size={'small'} value={scrapeIdSelected} onChange={onChangeHandler} id="outlined-basic" label="Scrape ID" variant="outlined" />              </Stack>

              <Stack direction="row">
                <StyledButton sx={{ fontSize: 10 }} disabled={scrapeIdSelected === ""} color="warning" size={'small'} onClick={() => {setScrapeIdSelected("")}} variant="outlined">Clear Selection</StyledButton>
                <StyledButton sx={{ fontSize: 10 }} disabled={scrapeIdSelected === ""} size={'small'} onClick={runAlgorithmsClickHandler} variant="outlined">Run Algorithms</StyledButton>
              </Stack>

              <ScrapeList onClickHandler={onScrapIdClickedHandler} ids={scrapeIds} />
            </Item>
          </Grid>
          <Grid xs={7}>
            <Item align={"left"} style={{ maxHeight: 700,overflow: 'auto' }}>
              <PrettyPrintJson data={algorithmsResponse} />
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
