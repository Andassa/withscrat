import React, { useEffect, useState } from 'react';
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

import axiosInstance from '../../../Lesmomdules/axiosInstance';

const columns = [
    { id: 'nom', label: 'Nom', minWidth: 170 },
    { id: 'prenom', label: 'Prénom', minWidth: 100 },
    { id: 'fonction', label: 'Fonction', minWidth: 100 },
    { id: 'service', label: 'Service', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'autorisation', label: 'Rôle', minWidth: 100 },
];
function createData(nom, prenom, fonction) {
    return { nom, prenom, fonction };
}

export default function BasicTabs(props) {
    const [value, setValue] = React.useState(0);
    const { enCours } = props;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [bloqueMessage, setBloqueMessage] = useState('');
    const [utilisateurBloque, setUtilisateurBloque] = useState();

    const [rows, setRows] = useState([
        createData('Rakotomanana', 'kaka', 'direction technique'),
        createData('Raholisoa', 'David', 'direction technique'),
        createData('Rakotoarison', 'Mihary', 'Employe carthotèque'),
        createData('Rabe', 'Zo', 'Employe carthotèque'),
        createData('Randria', 'Fanilo', 'Stagiaire'),
    ]);

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = (user) => {
        // const bloqueMessage = "Voulez vous vraiment bloquer "+utilisateur.nom +" "+utilisateur.prenom+" ?"
        setBloqueMessage("Voulez vous vraiment bloquer " + user.nom + " " + user.prenom + " ?");
        setUtilisateurBloque(user);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const confirmeBloque = (utilisateurBloque) => {
        const id = utilisateurBloque;
        const fetchData = async () => {
            try {
                const response = await axiosInstance.post('http://localhost:3000/admin/bloquer', id);
                if (response.data.hasOwnProperty('erreur')) {
                    window.location.href = '/login';
                }
                console.log(response);
            } catch (error) {
                console.error('Erreur lors de la requête GET :', error);
            }
        };
        fetchData();
        localStorage.setItem('indexPanel', 0);
        window.location.reload();
        setOpen(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickRow = (row) => {
        console.log("Ligne cliquée:", row);
        // Ajoutez ici le code pour ce qui doit se passer lors du clic sur une ligne
    };



    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {enCours
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code} >
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align} onClick={() => handleClickRow(row.id)}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <Button variant="outlined" color="error" onClick={() => handleClickOpen(row)}>
                                                Bloquer
                                            </Button>
                                            <Dialog
                                                open={open}
                                                onClose={() => handleClose('')}
                                                aria-labelledby="alert-dialog-title"
                                                aria-describedby="alert-dialog-description"
                                            >
                                                <DialogTitle id="alert-dialog-title">
                                                    {"Bloquer un utilisateur"}
                                                </DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText id="alert-dialog-description">
                                                        {bloqueMessage}
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button variant="outlined" onClick={() => handleClose()}>annuler</Button>
                                                    <Button variant="outlined" color="error" onClick={() => confirmeBloque(utilisateurBloque)} autoFocus> {/*eto ny farany 20-09-2024*/}
                                                        valider
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    )
}