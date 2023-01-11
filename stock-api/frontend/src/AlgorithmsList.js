import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'
import React, { useState, useEffect } from "react";
import CurrencyInput from './CurrencyInput';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';


const StyledInput = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const Row = props => {
  const { data, index, style } = props;
  const item = data.tickers[index];

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton onClick={() => data.testResultsClickHandler(item.ticker)}>
        <ListItemText>
          <div style={{ fontSize: 12, fontWeight: "bold" }}>{item.ticker}</div>
          <div style={{ fontSize: 10, fontWeight: "italic" }}>weight: {parseFloat(item.weight).toFixed(3)}</div>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};


export default function AlgorithmsList({ height,title, results, testResultsClickHandler, maxWidth, withFilter }) {

  const [tickerFilter, setTickerFilter] = React.useState("");
  const [marketCapFilter, setMarketCapFilter] = React.useState("5000000");
  const [filteredTickers, setFilteredTickers] = React.useState(null);



const tickerFilterChangeHandler = event => {
    console.log(event.target.value)
    let filteredBySymbol = results.filter(ticker => ticker.ticker.includes(event.target.value)).map(filteredTicker => {
        return filteredTicker
    })
    console.log(filteredBySymbol)
    setTickerFilter(event.target.value)
    setFilteredTickers(filteredBySymbol);
  };

  const buildItemData = () => {
    let tickers = filteredTickers ? filteredTickers : results
    return {tickers, testResultsClickHandler }
  }
  const getItemCount = () => {
    let tickers = filteredTickers ? filteredTickers : results
    return tickers.length
  }
 
  return (
    <Box
      sx={{ height: 600, maxWidth: maxWidth, bgcolor: 'background.paper' }}
    >
      <div style={{ fontSize: 12, fontWeight: "bold" }}>{title}</div>
      {withFilter && <Stack direction="row">
        <StyledInput
          fullWidth
          inputProps={{ style: { fontSize: 10 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 10 } }} // font size of input label
          size={'small'}
          value={tickerFilter}
          onChange={tickerFilterChangeHandler}
          id="algo-outlined-basic"
          label="Ticker Symbol"
          variant="outlined" />


      </Stack>}
      <FixedSizeList
        height={height}
        itemData={buildItemData()}
        // onClickHandler={onClickHandler}
        //   ids={idsŽs
        //   width={360}
        itemSize={60}
        itemCount={getItemCount()}
        overscanCount={5}
      >
        {Row}
      </FixedSizeList>
    </Box>
  );
}