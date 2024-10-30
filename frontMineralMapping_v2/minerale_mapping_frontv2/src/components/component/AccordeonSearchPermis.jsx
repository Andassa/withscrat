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
import axiosInstance from '../../Lesmomdules/axiosInstance';
import CircularProgress from '@mui/material/CircularProgress';

export default function ControlledAccordions(props) {
    const [numPermis, setNumPermis] = useState('');
    const [message, setMessage] = useState('');
    const [listePermis, setListePermis] = useState([]);
    const [loading, setLoading] = useState(false);

    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    const recherchePermis = async (event) => {
        setNumPermis(event.target.value);
        const envoye= {num: event.target.value};
        try {
            const response = await axiosInstance.post('http://localhost:3000/utilisateur/getPermis_byName', envoye);
            setLoading(true);
            if (response.data.hasOwnProperty('erreur')) {
                setLoading(false);
                setMessage(response.data.erreur);
                setListePermis([]);
            } else {
                setLoading(false);
                setMessage([]);
                setListePermis(response.data.result);
                console.log(response.data.result.length); 
            }
        } catch (error) {
            console.log(error);
        }
    };
    const {setSelectPermis} =props;
    const changePermisSelection = (valeur) => {
        // Met à jour la valeur du bouton avec la valeur passée en paramètre
        const test = listePermis.filter(permis => permis.gid == valeur);
        setSelectPermis(test[0]);
    };


    return (
        <div style={{ display: "flex", flexDirection: "column", padding: '10px' }}>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}  >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <div style={{ display: "flex" }}>
                        <p style={{ color: 'blue' }}>Numero de permis : </p>
                        <div style={{ flex: 1, padding: "10px 10px" }} ><OutlinedInput style={{ width: "100%", height: "30px", }} value={numPermis} onChange={recherchePermis} /></div>
                        <div style={{ display: "flex", alignItems: "center", padding: "0px 10px" }} >
                            <Button variant="contained">recherche</Button>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        {loading && <CircularProgress />} {/* Afficher le spinner si loading est true */}
                    </div>
                    <div style={{color:'red', display: "flex", justifyContent: "center", alignItems: "center"}}> <p>{message}</p> </div>
                    <div>
                        <List>
                            {
                                listePermis.map((item => {
                                    return (
                                        <div key={item?.gid}>
                                            <ListItem disablePadding >
                                                <ListItemButton
                                                onClick={() => changePermisSelection(item?.gid)}
                                                >
                                                    <ListItemIcon>
                                                        <img src="./license.png" alt='license' />
                                                    </ListItemIcon>
                                                    <ListItemText primary={item?.titres_no_ + '  ' + item?.registre_1} />
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
