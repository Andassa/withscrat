import React, { useState } from 'react';
import Paper from '@mui/material/Paper';

import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import axiosInstance from '../../../Lesmomdules/axiosInstance';


const columns = [
    { id: 'nom', label: 'Nom', minWidth: 170 },
    { id: 'prenom', label: 'Prénom', minWidth: 100 },
    { id: 'fonction', label: 'Fonction', minWidth: 100 },
    { id: 'service', label: 'Service', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'autorisation', label: 'Rôle', minWidth: 100 },
];

export default function BasicTabs(props) {
    const { bloque } = props;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };
  
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

   
    const [misokatra, setMisokatra] = React.useState(false);

    const handleMisokatra = (utilisateurDebloque) => {
        console.log(utilisateurDebloque)
        const id = utilisateurDebloque;
        const fetchData = async () => {
            try {
                const response = await axiosInstance.post('http://localhost:3000/admin/debloquer', id);
                if (response.data.hasOwnProperty('erreur')) {
                    window.location.href = '/login';
                }
                console.log(response);
            } catch (error) {
                console.error('Erreur lors de la requête GET :', error);
            }
        };
        fetchData();
        localStorage.setItem('indexPanel', 2);
        window.location.reload();
        setOpen(false);
        setMisokatra(true);
    };

    const handleMihidy = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setMisokatra(false);
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bloque
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <Button onClick={() => handleMisokatra(row)}>Débloquer</Button>
                                            <Snackbar open={misokatra} autoHideDuration={600} onClose={handleMihidy}>
                                                <Alert
                                                    onClose={handleClose}
                                                    severity="success"
                                                    variant="filled"
                                                    sx={{ width: '100%' }}
                                                >
                                                    utilisateur débloqué
                                                </Alert>
                                            </Snackbar>
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
                count={bloque.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    )
}