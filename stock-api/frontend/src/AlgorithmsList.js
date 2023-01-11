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
  const item = data.results[index];

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


export default function AlgorithmsList({ title, results, testResultsClickHandler, maxWidth, withFilter }) {

  const [tickerFilter, setTickerFilter] = React.useState("");
  const [marketCapFilter, setMarketCapFilter] = React.useState("5000000");
  const [filteredTickers, setFilteredTickers] = React.useState([]);

  useEffect(() => {
    let filteredByMarketCap = results.filter(ticker => parseFloat(ticker.marketCap) <= parseFloat(marketCapFilter)).map(filteredTicker => {
        return filteredTicker
    })
    setFilteredTickers(filteredByMarketCap);
  }, [results]);

const tickerFilterChangeHandler = event => {
    let filteredBySymbol = results.filter(ticker => ticker.symbol.includes(event.target.value)).map(filteredTicker => {
        return filteredTicker
    })
    setTickerFilter(event.target.value)
    setFilteredTickers(filteredBySymbol);
  };

const marketCapFilterChangeHandler = event => {
    
    let filteredByMarketCap = results.filter(ticker => parseFloat(ticker.marketCap) <= parseFloat(event.target.value)).map(filteredTicker => {
        return filteredTicker
    })
    setMarketCapFilter(event.target.value);
    setFilteredTickers(filteredByMarketCap);
  };
  
  return (
    <Box
      sx={{ height: 600, maxWidth: maxWidth, bgcolor: 'background.paper' }}
    >
      <div style={{ fontSize: 12, fontWeight: "bold" }}>{title}</div>
      {withFilter && <Stack direction="row">
        <CurrencyInput error={""} handleChange={marketCapFilterChangeHandler} value={marketCapFilter} />
        <StyledInput
          fullWidth
          inputProps={{ style: { fontSize: 10 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 10 } }} // font size of input label
          size={'small'}
          value={tickerFilter}
          onChange={tickerFilterChangeHandler}
          id="outlined-basic"
          label="Ticker Symbol"
          variant="outlined" />


      </Stack>}
      <FixedSizeList
        height={600}
        itemData={{ results, testResultsClickHandler }}
        // onClickHandler={onClickHandler}
        //   ids={ids}
        //   width={360}
        itemSize={60}
        itemCount={results.length}
        overscanCount={5}
      >
        {Row}
      </FixedSizeList>
    </Box>
  );
}