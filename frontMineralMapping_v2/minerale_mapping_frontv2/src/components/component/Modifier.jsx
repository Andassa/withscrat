import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import axiosInstance from '../../Lesmomdules/axiosInstance';


export default function RecipeReviewCard(props) {
    const { utilisateur, setUtilisateur } = props;
    const [fonction, setFonction] = useState([]);
    const [choixFonction, setChoixFonction] = useState('');
    const [values, setValues] = useState({
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        username: utilisateur.username,
        fonction: utilisateur.fonction,
        email: utilisateur.email,
        password: '',
    });


    useEffect(() => {
        try {
            fetch('http://localhost:3000/getAllFonction', {
                method: 'Get',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de l\'envoi du tableau JSON');
                    }
                    return response.json();
                })
                .then(data => setFonction(data))
                .catch(error => console.log(error));
        } catch (error) {
            console.log(error);
        }
    }, []);

    // Gestionnaire de changement pour les TextFields
    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues({
            ...values,
            [name]: value,
        });
    };


    const { modifier, setModifier } = props;
    const handleAnnuler = () => {
        setModifier(false)
    }
    const handleValider = async () => {
        console.log(values)
        try {
            const response = await axiosInstance.post('http://localhost:3000/updateProfile', values);
            setUtilisateur(values)

            setModifier(false)
        } catch (error) {
            console.error('Error sending form data:', error);
        }
    }

    const defaultProps = {
        options: fonction,
        getOptionLabel: (option) => option.fonction
    }
    const CustomPaper = styled(Paper)({
        maxHeight: '400px',  // augmenter selon vos besoins
        minWidth: '350px',
    });
    const handleInputChange = (event, newInputValue) => {
        console.log(newInputValue)
        setChoixFonction(newInputValue)
    };

    const textF = (<Box sx={{
        display: 'flex',
        flexDirection: 'column',
        '& .MuiTextField-root': { m: 2, width: '50ch' },
    }} style={{ alignItems: 'center' }}>
        <TextField
            id="standard-read-only-input"
            label="Nom"
            defaultValue={values.nom}
            variant="standard"
            name='nom'
            onChange={handleChange}
        />
        <TextField
            id="standard-read-only-input"
            label="Prénom"
            defaultValue={values.prenom}
            variant="standard"
            name='prenom'
            onChange={handleChange}
        />
        <TextField
            id="standard-read-only-input"
            label="Nom d'utilisateur"
            defaultValue={values.username}
            variant="standard"
            name='username'
            onChange={handleChange}
        />
        <TextField
            id="standard-read-only-input"
            label="Fonction"
            defaultValue={values.fonction}
            variant="standard"
            name='fonction'
            onChange={handleChange}
        />
        <TextField
            id="standard-read-only-input"
            label="Email"
            defaultValue={values.email}
            variant="standard"
            name='email'
            onChange={handleChange}
        />
        <TextField
            id="standard-read-only-input"
            label="Password"
            type="password"
            variant="standard"
            name='password'
            onChange={handleChange}
        />
        <TextField
            id="standard-read-only-input"
            label=" Confirmation Password"
            type="password"
            variant="standard"
        />
    </Box>);
    const [content, setContent] = useState(<div> </div>);
    useEffect(() => {
        if (utilisateur.nom !== null) {
            setContent(textF)
        }
    }, [utilisateur])
    return (
        <Card sx={{ maxWidth: 800, alignItems: 'center', padding: '30px' }}>
            <ArrowBackIcon />
            <CardHeader
                avatar={
                    <Avatar alt={utilisateur?.nom + ' ' + utilisateur?.prenom} src='assets/images/user.png' style={{ height: '125px', width: '125px', marginLeft: '130px' }} />
                }
            />
            <CardContent>
                {content}
                <Stack spacing={30} direction="row">
                    <Button variant="outlined" onClick={handleAnnuler} >Annuler</Button>
                    <Button variant="contained" onClick={handleValider}>Valider</Button>
                </Stack>
            </CardContent>
        </Card>
    );
}