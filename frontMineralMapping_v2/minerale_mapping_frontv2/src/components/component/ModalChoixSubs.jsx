import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import Box from '@mui/material/Box';
import axiosInstance from '../../Lesmomdules/axiosInstance';

import Grid from '@mui/material/Grid';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import TextField from '@mui/material/TextField';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function CustomizedDialogs(props) {
    const [open, setOpen] = React.useState(false);
    const { setSelectChoixSubs } = props;
    const [recherche, setRecherche] = useState('');

    

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };


    // Créer un état pour suivre les cases cochées
    const [checkedItems, setCheckedItems] = useState({});

    // Fonction pour gérer le changement d'état des cases cochées
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setCheckedItems({
            ...checkedItems,
            [name]: checked,
        });
    };
    const [subs1, setSubs1] = useState(null);
    const [rechercheSubs , setRechercheSubs]= useState([]);
    useEffect(() => {
        // Fonction pour effectuer la requête GET
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('http://localhost:3000/utilisateur/map');
                if (response.data.hasOwnProperty('erreur')) {
                    window.location.href = '/login';
                }
                setSubs1(response.data.substances);
                setRechercheSubs(response.data.substances);
                

            } catch (error) {
                console.error('Erreur lors de la requête GET :', error);
            }
        };
        fetchData();
    }, []); // Le tableau vide en tant que deuxième argument assure que cette effect est exécutée une seule fois après le rendu initial.

    let coche = [];

    const handleRecherche = (event) => {
        setRecherche(event.target.value);
        const filteredSubs1 = subs1.filter(sub =>
            sub.nom.toLowerCase().includes(event.target.value.toLowerCase())
          );
        
        setRechercheSubs(filteredSubs1)
    }

    const handelConfirmation = () => {
        const checkedList = Object.keys(checkedItems).filter(key => checkedItems[key]);
        checkedList.forEach(checkedItem =>
            coche.push(subs1.filter(item => item.id == checkedItem)[0])
        )
        if (coche.length == checkedList.length) {
            setSelectChoixSubs(coche);
        }
        setOpen(false);
    }
    return (
        <React.Fragment>
            <Button size='small' onClick={handleClickOpen}>
                <AddCircleOutlineRoundedIcon color="primary" />ajouter d'autre Substances
            </Button>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth="md"
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    séléctionner d'autres substances à ajouter
                    <TextField
                        id="standard-search"
                        label="rechercher des substances"
                        type="search"
                        variant="standard"
                        style={{ width: "100%" }}
                        value={recherche}
                        onChange={handleRecherche}
                    />
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <Box sx={{ flexGrow: 1 }} style={{ height: '500px', overflowY: 'scroll', }}>
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 16 }}>
                            {rechercheSubs && rechercheSubs.map((sub) => (
                                <Grid item xs={1} sm={3} md={4} key={sub.id}>
                                    <FormControlLabel control={
                                        <Checkbox
                                            checked={checkedItems.hasOwnProperty(sub.id) ? checkedItems[sub.id] : false}  // Vérifier si la case est cochée
                                            onChange={handleCheckboxChange}
                                            name={sub.id.toString()} // Utiliser la valeur unique de chaque case comme nom
                                        />} label={sub.nom} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handelConfirmation}>
                        confirmer
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
