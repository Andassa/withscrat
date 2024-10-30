import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";
const params = {
    q: '',
    format: 'json',
    addressdetails: 'addressdetails',
};


export default function ControlledAccordions(props) {
    const { selectPosition, setSelectPosition } = props;
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [listePlace, setListePlace] = useState([]);

    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div style={{display: "flex", flexDirection: "column", padding:'10px'}}> 
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}  >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <div style={{ display: "flex" }}>
                        <div style={{ flex: 1, padding: "10px 10px" }} ><OutlinedInput style={{ width: "100%", height: "30px", }} value={searchText} onChange={(event) => { setSearchText(event.target.value) }} /></div>
                        <div style={{ display: "flex", alignItems: "center", padding: "0px 10px" }} >
                            <Button variant="contained" onClick={() => {
                                setLoading(true);
                                const params = {
                                    q: searchText,
                                    format: 'json',
                                    addressdetails: 1,
                                    polygon_geojson: 0
                                };
                                const queryString = new URLSearchParams(params).toString();
                                console.log(queryString);
                                const requestOptions = {
                                    method: "GET",
                                    redirect: "follow",
                                }
                                fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOptions)
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok');
                                        }
                                        return response.json(); // Parse automatiquement la réponse JSON
                                    })
                                    .then((result) => {
                                        setListePlace(result);
                                        console.log(listePlace);
                                        setLoading(false);
                                    })
                                    .catch((err) => {
                                        console.log("Error: ", err);
                                        setLoading(false)
                                    });

                            }
                            }
                            >recherche</Button>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        {loading && <CircularProgress />} {/* Afficher le spinner si loading est true */}
                    </div>
                    <div>
                        <List>
                            {
                                listePlace.map((item => {
                                    return (
                                        <div key={item?.osm_id}>
                                            <ListItem disablePadding onClick={() => {
                                                setSelectPosition(item);
                                            }} >
                                                <ListItemButton>
                                                    <ListItemIcon>
                                                        <img src="./location.png" alt='location' />
                                                    </ListItemIcon>
                                                    <ListItemText primary={item?.display_name} />
                                                </ListItemButton>
                                            </ListItem>
                                        </div>
                                    )
                                }))
                            }

                        </List>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}
