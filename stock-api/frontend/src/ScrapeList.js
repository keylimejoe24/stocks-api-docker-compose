import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const Row = props => {
  const { data, index, style } = props;
  const item = data.ids[index].id;
  const tickers = data.ids[index].tickers;
  const date = data.ids[index].created;
  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={() => data.deleteOnClickHandler(item)} aria-label="delete" size="small">
          <DeleteIcon fontSize="inherit" />
        </IconButton>
        <ListItemButton onClick={() => data.onClickHandler(item)}>
          <ListItemText>
            <div style={{ fontSize: 10, fontWeight: "bold" }}>{"Scrape Date: " + date}</div>
            <div style={{ fontSize: 10 }}>{item} </div>
            <div style={{ fontSize: 10 }}>{"Ticker Count: " + tickers.length}</div>
          </ListItemText>
        </ListItemButton>
      </Stack>

    </ListItem>
  );
};

export default function ScrapeList({ ids, maxWidth,onClickHandler,deleteOnClickHandler }) {
  return (
    <Box
      sx={{ width: '100%', height: 400, maxWidth: maxWidth, bgcolor: 'background.paper' }}
    >
      <FixedSizeList
        height={400}
        itemData={{ ids, onClickHandler,deleteOnClickHandler }}
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