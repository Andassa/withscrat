import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import ListeUtilisateur from './gestionUtilisateurs/listeUtilisateurs'
import ValidationUtilisateur from './gestionUtilisateurs/validationUtilisateur'
import BloqueUtilisateur from './gestionUtilisateurs/bloqueUtilisateur'

import axiosInstance from '../../Lesmomdules/axiosInstance';

const columns = [
    { id: 'nom', label: 'Nom', minWidth: 170 },
    { id: 'prenom', label: 'Prénom', minWidth: 100 },
    { id: 'fonction', label: 'Fonction', minWidth: 100 },
    { id: 'service', label: 'Service', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'autorisation', label: 'Rôle', minWidth: 100 },
];
//nom prenom nom d'utilisateur fonction service email role

function createData(nom, prenom, fonction) {
    return { nom, prenom, fonction };
}

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


export default function BasicTabs() {
    const [value, setValue] = React.useState(0);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [listeUtilisateurs, setListeUtilisateurs] = useState([]);
    const [enCours, setEncours] = useState([]);
    const [enAttente, setEnAttente] = useState([]);
    const [bloque, setBloque] = useState([]);

    const newIndex = localStorage.getItem('indexPanel');
    useEffect(() => {
        console.log(newIndex);
        if (newIndex == 0) {
            setValue(0);
        }
        if (newIndex == 1) {
            setValue(1);
        }
        if (newIndex == 2) {
            setValue(2);
        }
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('http://localhost:3000/admin/allUser');
                if (response.data.hasOwnProperty('erreur')) {
                    window.location.href = '/login';
                }
                setEncours(response.data.filter(element => element.etat === 2));
                setEnAttente(response.data.filter(element => element.etat === 1));
                setBloque(response.data.filter(element => element.etat === 3));

                setListeUtilisateurs(response.data)

            } catch (error) {
                console.error('Erreur lors de la requête GET :', error);
            }
        };
        fetchData();
    }, []);


    const [rows, setRows] = useState([
        createData('Rakotomanana', 'Jerry', 'direction technique'),
        createData('Raholisoa', 'David', 'direction technique'),
        createData('Rakotoarison', 'Mihary', 'Employe carthotèque'),
        createData('Rabe', 'Zo', 'Employe carthotèque'),
        createData('Randria', 'Fanilo', 'Stagiaire'),
    ]);
    const [rows2, setRows2] = useState([
        createData('Rabenja', 'Mitia', 'Stagiaire'),
    ])
    const [rows3, setRows3] = useState([
        createData('Rakoto', 'Rojotiana', 'stagiaire', 'bloqué'),
        createData('Andassa', 'Fanomezantsoa', 'stagiaire', 'bloqué'),
        createData('Rafanomezantsoa', 'Rado', 'stagiaire', 'bloqué'),
    ])

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const handleClose1 = () => {
        const filteredRows = rows.filter(row => row.nom !== 'Rabe');
        setRows(filteredRows);
        const newItem = createData('Rabe', 'Zo', 'Employe carthotèque');
        setRows3([...rows3, newItem]);
        setOpen(false);
    };
    const handleClose2 = () => {
        const filteredRows = rows2.filter(row => row.nom !== 'Rabenja');
        setRows2(filteredRows);
        const newItem = createData('Rabenja', 'Mitia', 'Stagiaire')
        setRows([...rows, newItem]);
        setOpen(false);
    };
    const handleClose3 = () => {
        const filteredRows = rows3.filter(row => row.nom !== 'Rakoto');
        setRows(filteredRows);
        const newItem = createData('Rakoto', 'Rojotiana', 'stagiaire')
        setRows([...rows, newItem]);
        setOpen(false);
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const [misokatra, setMisokatra] = React.useState(false);

    const handleMisokatra = () => {
        const filteredRows = rows3.filter(row => row.nom !== 'Rakoto');
        setRows3(filteredRows);
        const newItem = createData('Rakoto', 'Rojotiana', 'stagiaire')
        setRows([...rows, newItem]);
        setOpen(false);
        setMisokatra(true);
    };
    const handleMihidy = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setMisokatra(false);
    };
    const handleClick = () => {
        setMisokatra(true);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Liste des utilisateurs" {...a11yProps(0)} />
                    <Tab label="Liste des demandes en attente de validation" {...a11yProps(1)} />
                    <Tab label="Liste des bloqués" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <ListeUtilisateur enCours={enCours} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ValidationUtilisateur enAttente={enAttente} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <BloqueUtilisateur bloque={bloque} />
            </CustomTabPanel>
        </Box >
    );
}
