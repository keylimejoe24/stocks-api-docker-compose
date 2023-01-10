import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'

// "symbol": "AAMC",
// "name": "Altisource Asset Management Corp Com",
// "lastsale": "$20.25",
// "netchange": "-0.0636",
// "pctchange": "-0.313%",
// "volume": "7516",
// "marketCap": "35988401.00",
// "country": "United States",
// "ipoyear": "",
// "industry": "Investment Managers",
// "sector": "Finance",
// "url": "/market-activity/stocks/aamc"


  const Row = props => {
    const { data, index, style } = props;
    const item = data.results[index];
    
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={() => data.testResultsClickHandler(item.ticker)}>
          <ListItemText>
            <div style={{ fontSize: 15, fontWeight:"bold" }}>{item.symbol}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>name: </span>{item.name}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>last sale: </span>{item.lastsale}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>percent change: </span>{item.pctchange}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>volume: </span>{item.volume}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>market cap: </span>{item.marketCap}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>country: </span>{item.country}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>ipo year: </span>{item.netchange}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>net change: </span>{item.netchange}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>industry: </span>{item.industry}</div>
            <div style={{ fontSize: 8, fontWeight:"italic" }}><span style={{ fontSize: 10, fontWeight:"bold" }}>sector: </span>{item.sector}</div>
            {/* <div style={{ fontSize: 10, fontWeight:"italic" }}>weight: {parseFloat(item.weight).toFixed(3)}</div> */}
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  };


  export default function TickerList({ title,results,testResultsClickHandler,maxWidth  }) {
    
   console.log(results)
    return (
      <Box
        sx={{ height: 400, maxWidth: maxWidth, bgcolor: 'background.paper' }}
      >
        <div style={{ fontSize: 12, fontWeight:"bold" }}>{title}</div>

        <FixedSizeList
          height={390}
          itemData={{results,testResultsClickHandler}}
          // onClickHandler={onClickHandler}
        //   ids={ids}
        //   width={360}
          itemSize={200}
          itemCount={results.length}
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      </Box>
    );
  }