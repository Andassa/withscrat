import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { experimentalStyled as styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ChoixSubs from './ModalChoixSubs';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));
export default function OutlinedCard(props) {
    const [selectChoixSubs, setSelectChoixSubs] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const {setChoixSubs } = props;

    useEffect(() => {
        const initialCheckedItems = {};
        if (selectChoixSubs) {
            selectChoixSubs.forEach(sub => {
                initialCheckedItems[sub.id] = true;
            });
            setCheckedItems(initialCheckedItems);
        }
    }, [selectChoixSubs]);

    const handleCheckboxChange = (event, id) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [id]: event.target.checked
        }));
    };
    useEffect(() => {
        const checkedSubs = Object.entries(checkedItems)
            .filter(([key, value]) => value === true)
            .map(([key, value]) => parseInt(key));
            setChoixSubs(checkedSubs);
    }, [checkedItems])

    return (
        <Box sx={{ minWidth: 275, padding: '10px' }}>
            <Card variant="outlined">
                <React.Fragment>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            Substances séléctionnées : {selectChoixSubs.length}
                        </Typography>

                    </CardContent>
                    <Box sx={{ flexGrow: 1 }} style={{ height: '230px', overflowY: 'scroll', }}>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            {selectChoixSubs && selectChoixSubs.map((sub) => (
                                <Grid item xs={1} sm={3} md={4} key={sub.id}>
                                    <Item><FormControlLabel control={
                                        <Checkbox
                                            checked={checkedItems[sub.id] || false}
                                            onChange={(event) => handleCheckboxChange(event, sub.id)}
                                        />
                                    } label= {sub.nom} /></Item>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                    <CardActions>
                        <ChoixSubs selectChoixSubs={selectChoixSubs} setSelectChoixSubs={setSelectChoixSubs} />
                    </CardActions>
                </React.Fragment>
            </Card>
        </Box>
    );
}
