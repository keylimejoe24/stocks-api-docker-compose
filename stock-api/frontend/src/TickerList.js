import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'
import CurrencyInput from './CurrencyInput';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import React, { useState, useEffect } from "react";


const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
}));
const StyledInput = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(1),
  }));
const Row = props => {
    const { data, index, style } = props;
    const item = data.filteredTickers[index];

    return (
        <ListItem style={style} key={index} component="div" disablePadding>
            <ListItemButton onClick={() => data.testResultsClickHandler(item.ticker)}>
                <ListItemText>
                    <div style={{ fontSize: 15, fontWeight: "bold" }}>{item.symbol}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>name: </span>{item.name}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>last sale: </span>{item.lastsale}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>percent change: </span>{item.pctchange}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>volume: </span>{item.volume}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>market cap: </span>{item.marketCap}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>country: </span>{item.country}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>ipo year: </span>{item.netchange}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>net change: </span>{item.netchange}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>industry: </span>{item.industry}</div>
                    <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>sector: </span>{item.sector}</div>
                </ListItemText>
            </ListItemButton>
        </ListItem>
    );
};


export default function TickerList({ title, results, testResultsClickHandler, maxWidth, scrapeStartClickHandler,  tickerFilter, setTickerFilter,marketCapFilter, setMarketCapFilter,filteredTickers, setFilteredTickers }) {

    
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
            sx={{ height: 400, maxWidth: maxWidth, bgcolor: 'background.paper' }}
        >
            <div style={{ fontSize: 12, fontWeight: "bold" }}><div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>Ticker Count: </span> {results.length}</div>
                <div style={{ fontSize: 12, fontWeight: "italic" }}><span style={{ fontSize: 10, fontWeight: "bold" }}>Tickers Filtered By Market Count: </span> {filteredTickers.length}</div></div>
            <Stack direction="row">
                
                <StyledButton size={'small'} color="success" onClick={scrapeStartClickHandler} variant="outlined">Start Scrape</StyledButton>

            </Stack>
            <Stack direction="row">
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


            </Stack>

            <FixedSizeList
                height={270}
                itemData={{ filteredTickers, testResultsClickHandler }}
                // onClickHandler={onClickHandler}
                //   ids={ids}
                //   width={360}
                itemSize={230}
                itemCount={filteredTickers.length}
                overscanCount={5}
            >
                {Row}
            </FixedSizeList>
        </Box>
    );
}