import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fontSize } from '@mui/system';
import { FixedSizeList } from 'react-window';
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid';



const Row = props => {
    const { data, index, style } = props;
    const item = data.results[index];
    let entries = Object.entries(item)

    return (
        <ListItem style={style} key={index} component="div" >

            <ListItemButton onClick={() => data.testResultsClickHandler(item.ticker)}>
                <ListItemText key={uuidv4()}>
                    
                    {index === 0 && 
                    <>
                     <span style={{ fontSize: 12, fontWeight: "bold" }}>{entries[0][0] + ": "}</span>
                     <span style={{ fontSize: 12 }}>{entries[0][1]}</span> 
                    </>
                     }
                   
                    {index != 0 && 
                    <>
                        <div style={{ fontSize: 12, fontWeight: "bold" }}>{entries[0][0]}</div>
                    <pre style={{ fontSize: 8 }}>{Object.entries(entries[0][1]).map(([key, value]) => (
                        `${key}: ${value}\n`
                    ))}</pre>
                    </>
                     }

                  

                </ListItemText>



            </ListItemButton>
        </ListItem>
    );
};


export default function TestResultsList({ title, results, testResultsClickHandler, maxWidth }) {

    console.log(results)
    return (
        <Box
            sx={{ height: 600, maxWidth: maxWidth, bgcolor: 'background.paper' }}
        >
            <div style={{ fontSize: 12, fontWeight: "bold" }}>{title}</div>

            <FixedSizeList
                height={600}
                itemData={{ results, testResultsClickHandler }}
                itemSize={120}
                itemCount={results.length}
                overscanCount={5}

            >
                {Row}
            </FixedSizeList>
        </Box>
    );
}