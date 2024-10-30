import React, { useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';

export default function StickyHeadTable(props) {
    const { listeCentre } = props;
    const {setCarreSelect} = props;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    async function handleSelect(index,page) {
        const p = page*10;
        const index1 = p+index;
        setCarreSelect([listeCentre[index1]])
    };
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                {/* <caption>A basic table example with a caption</caption> */}
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">x</TableCell>
                            <TableCell align="center">y</TableCell>
                            <TableCell align="center">longitude</TableCell>
                            <TableCell align="center">latitude</TableCell>
                            <TableCell align="center"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listeCentre
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                        <TableCell align="center" >{row.x}</TableCell>
                                        <TableCell align="center" >{row.y}</TableCell>
                                        <TableCell align="center" >{row.lng}</TableCell>
                                        <TableCell align="center" >{row.lat}</TableCell>
                                        <TableCell align="center">
                                            <Link href="#" onClick={() => handleSelect(index,page)} underline="hover">
                                                {'Afficher'}
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100, 1000, 1500]}
                component="div"
                count={listeCentre.length}
                rowsPerPage={rowsPerPage}
                page={page}
                ///la pagination ne marche pas très bien !!!!
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}