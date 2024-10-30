import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { green, yellow } from '@mui/material/colors'; // Importez les couleurs de MUI



const columns = [
    { id: 'subs', label: 'Substance', minWidth: 170 },
    { id: 'prob', label: 'par lithologie', minWidth: 100 },
    { id: 'probIndice', label: 'par indice', minWidth: 100 },
];

function createData(subs, res, prob, indice) {
    if (res === 1) {
        prob = 'nulle';
    }
    if (res === 2) {
        prob = 'faible';
    }
    if (res === 3) {
        prob = 'moyenne';
    }
    if (res === 4) {
        prob = 'élevée';
    }
    if (res === 0) {
        prob = 'erreur';
    }
    var probIndice = 20 ; 
    console.log(indice);
    if (indice === 1) {
        probIndice = 'nulle';
    }
    if (indice === 3 || indice === 2) {
        probIndice = 'moyenne';
    }
    if (indice === 4) {
        probIndice = 'élevée';
    }
    if (indice === 0) {
        probIndice = 'erreur';
    }
    return { subs, prob, probIndice };
}


export default function StickyHeadTable(props) {
    const { selectedValue } = props;
    const [page, setPage] = React.useState(0);
    const [tab, setTab] = useState([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const { resultat } = props;

    useEffect(() => {
        let t = []
        if (resultat.length !== 0) {
            console.log(resultat)
            resultat.sort((a, b) => parseInt(b.result) - parseInt(a.result));
            const nb = parseInt(selectedValue);
            if (nb > resultat.length) {
                resultat.forEach(element => {
                    t.push(createData(element.subs, element.result, 0, element.probIndice))
                });
            } else {
                for (let i = 0; i < nb; i++) {
                    t.push(createData(resultat[i].subs, resultat[i].result, 0, resultat[i].probIndice, 0))
                }
            }
            console.log(t)
            setTab(t);
        }
    }, [resultat, selectedValue])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
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
                        {tab
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            let cellStyle = {};

                                            // Appliquer les styles conditionnels
                                            if (value === 'élevée') {
                                                // cellStyle = { backgroundColor: green[500], color: 'green' };
                                                cellStyle = { color: 'green' };
                                            } else if (value === 'moyenne') {
                                                cellStyle = { color: 'rgb(213, 214, 3)' };
                                            } else if (value === 'faible') {
                                                cellStyle = { color: 'orange' };
                                            } else if (value === 'nulle') {
                                                cellStyle = { color: 'red' };
                                            }

                                            return (
                                                <TableCell key={column.id} align={column.align} style={cellStyle}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}cd ""
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={tab.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}