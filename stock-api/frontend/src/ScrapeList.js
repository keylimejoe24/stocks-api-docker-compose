import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'

function renderRow({ data, index, style }) {

    const item = data[index].id;
    const date =  data[index].created;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={data.onClickHandler}>
          <ListItemText>
           
            <div style={{ fontSize: 8 }}>{"Scrape Date: " + date}</div>
            <div style={{ fontSize: 10 }}>{item} </div>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  }
  const Row = props => {
    const { data, index, style } = props;
    const item = data.ids[index].id;
    const date =  data.ids[index].created;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={() => data.onClickHandler(item)}>
          <ListItemText>
            <div style={{ fontSize: 10, fontWeight:"bold" }}>{"Scrape Date: " + date}</div>
            <div style={{ fontSize: 10 }}>{item} </div>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  };
  
  export default function ScrapeList({ ids,onClickHandler }) {
    return (
      <Box
        sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }}
      >
        <FixedSizeList
          height={400}
          itemData={{ids,onClickHandler}}
          // onClickHandler={onClickHandler}
        //   ids={ids}
        //   width={360}
          itemSize={60}
          itemCount={ids.length}
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      </Box>
    );
  }