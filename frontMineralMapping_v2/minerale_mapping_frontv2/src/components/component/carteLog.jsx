import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import axiosInstance from '../../Lesmomdules/axiosInstance';
import { Alert } from 'antd';

export default function ImgMediaCard() {
    const navigate = useNavigate();
    const [messageErreur, setMessageErreur] = useState('');
    const [messageSuccess, setMessageSuccess] = useState('');
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/sendDatalogin', formData);
            setMessageErreur('');
            setMessageSuccess('');
            if (response.data?.erreur) {
                const msg = response.data.erreur.message || response.data.erreur;
                setMessageErreur(typeof msg === 'string' ? msg : 'Erreur de connexion');
                return;
            }
            localStorage.setItem('userToken', JSON.stringify(response.data));
            setMessageSuccess('Connexion réussie !');
            const redirect = response.data.redirect || (response.data.role === 'admin' ? '/admin/dashboard' : '/map');
            navigate(redirect);
        } catch (error) {
            const msg = error.response?.data?.erreur?.message || error.response?.data?.erreur || 'Erreur de connexion';
            setMessageErreur(typeof msg === 'string' ? msg : 'Erreur de connexion');
        }
    };

    return (
        <Card sx={{ maxWidth: 500, alignItems: 'center', padding: '20px' }}>
            <Typography variant="h3" gutterBottom style={{ color: 'rgb(43, 102, 147)', textAlign: 'center' }}>Connexion</Typography>
            {messageSuccess && <Alert message={messageSuccess} type="success" style={{ marginBottom: 16 }} />}
            {messageErreur && <Alert message={messageErreur} type="error" style={{ marginBottom: 16 }} />}
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', '& .MuiTextField-root': { width: '25ch' } }}>
                        <TextField label="nom d'utilisateur" margin="dense" name="username" value={formData.username} onChange={handleChange} required />
                        <TextField label="mot de passe" margin="dense" type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </Box>
                </CardContent>
                <Button type="submit" variant="contained" style={{ float: 'right' }}>se connecter</Button>
            </form>
            <CardActions>
                <Button size="small" onClick={() => navigate('/inscription')}>Inscription</Button>
            </CardActions>
        </Card>
    );
}
