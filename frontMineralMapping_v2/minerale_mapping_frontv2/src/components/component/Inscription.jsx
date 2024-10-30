import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import axiosInstance from '../../Lesmomdules/axiosInstance';


export default function ImgMediaCard() {

    const [fonctions, setFonctions] = useState([]);
    const [services, setServices] = useState([]);
    const [service, setService] = useState('');
    const [fonction, setFonction] = useState('');
    const [passwordErreur, setPasswordErreur] = useState('');
    const [dataErreur, setDataErreur] = useState('');
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        username: '',
        fonction: '',
        service: '',
        email: '',
        password: '',
        password2: ''
    });
    const verificationPassword = (password) => {
        const minLength = /.{8,}/;
        const hasUppercase = /[A-Z]/;
        const hasLowercase = /[a-z]/;
        const forbiddenCharacters = /["'<>\\/|;&?#=]/;

        if (forbiddenCharacters.test(password)) {
            return 'Le mot de passe contient des caractères interdits.';
        }
        if (!minLength.test(password)) {
            return 'Le mot de passe doit contenir au moins 8 caractères.';
        }
        if (!hasUppercase.test(password)) {
            return 'Le mot de passe doit contenir au moins une majuscule.';
        }
        if (!hasLowercase.test(password)) {
            return 'Le mot de passe doit contenir au moins une minuscule.';
        }
        return 'okay';
    };
    const validerEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            return 'Adresse e-mail invalide.';
        }

        return 'okay'; // Retourne une chaîne vide si l'e-mail est valide
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'password2') {
            if (formData.password !== value) {
                setPasswordErreur('Les mots de passe ne correspondent pas');
            }
            else {
                setPasswordErreur('');
            }
        }

        setFormData({ ...formData, [name]: value });
    }

    const handleChangeService = (event, newInputValue) => {
        setService(newInputValue);
    };
    const handleChangeFonction = (event, newInputValue) => {
        setFonction(newInputValue);
    };

    useEffect(() => {
        setFormData({ ...formData, service: service, fonction: fonction });
    }, [service, fonction])




    const handleSubmit = async (e) => {
        e.preventDefault();
        // window.location.href = '/login';
        try {

            const forbiddenCharacters = /["'<>\\/|;&?#=]/;
            const verifMdp = verificationPassword(formData.password);
            if (verifMdp !== 'okay') {
                setDataErreur(verifMdp);
            }else{setDataErreur(''); }
            if (formData.nom === '' || forbiddenCharacters.test(formData.nom)) {
                setDataErreur('nom vide ou contient un caractère interdit');
            }
            if (forbiddenCharacters.test(formData.prenom)) {
                setDataErreur('prénom contient un caractère interdit');
            }
            if (formData.username === '' || forbiddenCharacters.test(formData.username)) {
                setDataErreur('nom d\'utilisateur vide ou contient un caractère interdit');
            }
            const verifEmail = validerEmail(formData.email);
            if (formData.email === '' || verifEmail!=='okay') {
                setDataErreur('email vide ou invalide');
            }
            if (formData.service === '' || forbiddenCharacters.test(formData.service)) {
                setDataErreur('service vide ou contient un caractère interdit');
            }
            if (formData.fonction === '' || forbiddenCharacters.test(formData.fonction)) {
                setDataErreur('fonction vide ou contient un caractère interdit');
            }
            if (formData.password.length < 8) {
                setDataErreur('Le mot de passe doit contenir plus de 8 caractères.');
            }
            console.log(formData);

            if (dataErreur==='' && passwordErreur==='') {
                console.log('ato',formData)
                const response = await axiosInstance.post('http://localhost:3000/register', formData);
                if (response.data.hasOwnProperty('erreur')) {
                    setDataErreur(response.data.erreur.message);
                } 
                console.log(
                    "QQQ resp",response.data)
                
                //window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error sending form data:', error);
        }
    };


    useEffect(() => {
        try {
            fetch('http://localhost:3000/getServiceFonction', {
                method: 'Get',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de l\'envoi du tableau JSON');
                    }
                    return response.json();
                })
                .then(
                    data => {
                        console.log(data);
                        setFonctions(data.fonction)
                        setServices(data.service)
                    }

                )
                .catch(error => console.log(error));
        } catch (error) {
            console.log(error);
        }
    }, []);

    const retour = async (e) => {
        window.location.href = '/login';
    }
    const listeService = {
        options: services,
        getOptionLabel: (option) => option,
    };
    const listeFonction = {
        options: fonctions,
        getOptionLabel: (option) => option,
    };

    return (
        <Card sx={{ maxWidth: 800, alignItems: 'center', padding: '20px' }}>
            <Typography variant="h3" gutterBottom style={{ color: 'rgb(43, 102, 147)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50px' }} >
                Demande d'inscription
            </Typography>

            <form onSubmit={handleSubmit} >
                <CardContent >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        '& .MuiTextField-root': { width: '50ch' },
                    }} style={{ alignItems: 'center' }}>

                        <TextField label={'Nom'}
                            id="margin-dense" margin="dense"
                            name='nom'
                            value={formData.nom}
                            onChange={handleChange} required />

                        <TextField
                            label={'Prénom'}
                            id="margin-dense" margin="dense"
                            name='prenom'
                            value={formData.prenom}
                            onChange={handleChange} />

                        <TextField
                            label={'Nom d\'utilisateur'}
                            id="margin-dense" margin="dense"
                            name='username'
                            value={formData.username}
                            onChange={handleChange} required />

                        <TextField
                            label={'Email'}
                            id="margin-dense" margin="dense" type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange} required />

                        <Autocomplete
                            {...listeService}
                            id="free-solo-2-demo"
                            freeSolo
                            name='service'
                            inputValue={service}
                            onInputChange={handleChangeService}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="service"
                                    required
                                />
                            )}
                            sx={{ m: 0, minWidth: 170, display: 'flex' }}
                            style={{ padding: '5px' }}
                        />
                        <Autocomplete
                            {...listeFonction}
                            id="free-solo-2-demo"
                            freeSolo
                            name='fonction'
                            inputValue={fonction}
                            onInputChange={handleChangeFonction}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="fonction"
                                    required
                                />
                            )}
                            sx={{ m: 0, minWidth: 170, display: 'flex' }}
                            style={{ padding: '5px' }}
                        />

                        <TextField
                            label={'Mot de passe'}
                            id="margin-dense" margin="dense" type="password"
                            name='password'
                            value={formData.password}
                            onChange={handleChange} required />

                        <TextField
                            label={'Confirmation mot de passe'}
                            id="margin-dense" margin="dense" type='password'
                            name='password2'
                            value={formData.password2}
                            onChange={handleChange} required />


                    </Box>
                </CardContent>
                <Typography style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center' }} variant="overline" display="block" gutterBottom>
                    {passwordErreur}
                </Typography>
                <Typography style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center' }} variant="overline" display="block" gutterBottom>
                    {dataErreur}
                </Typography>
                <Button type="submit" variant="contained" onClick={handleSubmit} style={{ float: 'right' }} disabled={passwordErreur !== ''} >
                    se connecter
                </Button>
            </form>
            <CardActions>
                <Button size="small" onClick={retour} >retour</Button>
            </CardActions>
        </Card>
    );
}
