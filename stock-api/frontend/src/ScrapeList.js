import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'

function renderRow(props) {
    const { index, style,data} = props;
    const item = data[index];
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText>
           
            <div style={{ fontSize: 8 }}>{"Scrape Date: " + new Date()}</div>
            <div style={{ fontSize: 10 }}>{item} </div>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  }
  
  export default function ScrapeList({ ids }) {
    return (
      <Box
        sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }}
      >
        <FixedSizeList
          height={400}
          itemData={ids}
        //   ids={ids}
        //   width={360}
          itemSize={60}
          itemCount={ids.length}
          overscanCount={5}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
    );
  }