import './App.css';
import React, { useState, useEffect } from "react";
// import {Button} from '@material-ui/core'; //importing material ui component
// import { styled } from '@mui/material/styles';
// import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
// import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ScrapeList from './ScrapeList';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fafafa',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  margin: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));


export default function App() {
  const [inputValue, setInputValue] = React.useState("");
  const [scrapeIds, setScrapeIds] = React.useState([]);
  const [algorithmsResponse, setAlgorithmsResponse] = useState([]);

  const onChangeHandler = event => {
    console.log(event)
    setInputValue(event.target.value);
  };
  const onClickHandler = event => {
    console.log(event)
    // setInputValue(event.target.value);
  };

  const PrettyPrintJson = ({ data }) => (<div><pre>{JSON.stringify(data, null, 2)}</pre></div>);
 

  useEffect(() => {
    fetch(`http://${process.env.REACT_APP_MASTER_IP}:3001/api/algorithms/ids`, { method: "GET" })
      .then(res => res.json())
      .then(response => {
        console.log(response)
        setScrapeIds(response)
      })
      .catch(error => console.log(error));
  }, []);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>

        <Grid container spacing={2}>

          <Grid xs={4}>
            <Item>
              <StyledInput size={'small'} onChange={onChangeHandler} id="outlined-basic" label="Scrape ID" variant="outlined" />
              <StyledButton size={'small'} onClick={onClickHandler} variant="outlined">Run Algorithms</StyledButton>
            </Item>
            <Item>
            <ScrapeList ids={scrapeIds} />
            </Item>
          </Grid>
          <Grid xs={8}>
            <Item>
              <PrettyPrintJson data={`{ algorithm : results }`} />
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
