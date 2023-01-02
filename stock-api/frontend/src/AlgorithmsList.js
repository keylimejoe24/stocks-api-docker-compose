import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'


  const Row = props => {
    const { data, index, style } = props;
    const item = data.results[index];
    
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={() => data.testResultsClickHandler(item.ticker)}>
          <ListItemText>
            <div style={{ fontSize: 12, fontWeight:"bold" }}>{item.ticker}</div>
            <div style={{ fontSize: 10, fontWeight:"italic" }}>weight: {parseFloat(item.weight).toFixed(3)}</div>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  };


  export default function AlgorithmsList({ title,results,testResultsClickHandler,maxWidth  }) {
    
   console.log(results)
    return (
      <Box
        sx={{ height: 600, maxWidth: maxWidth, bgcolor: 'background.paper' }}
      >
        <div style={{ fontSize: 12, fontWeight:"bold" }}>{title}</div>

        <FixedSizeList
          height={600}
          itemData={{results,testResultsClickHandler}}
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