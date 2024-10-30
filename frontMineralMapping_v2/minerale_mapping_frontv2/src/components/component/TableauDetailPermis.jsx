import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(libelle, valeur) {
  return { libelle, valeur };
}
const colonne = ['gid', 'objectid','titres_no_','registre_1','registre_2','shape_area','titre', 'type_tit_1']
const rows = [
  createData('Frozen yoghurt', 159),
  createData('Ice cream sandwich', 237),
  createData('Eclair', 262),
];

export default function AccessibleTable(props) {
  const { selectPermis } = props;
  return (
    <TableContainer component={Paper}style={{ maxHeight: '300px' }}>
      <Table sx={{ minWidth: 300 }} aria-label="caption table">
        {/* <caption>A basic table example with a caption</caption> */}
        <TableHead>
          <TableRow>
            <TableCell>libelle</TableCell>
            <TableCell align="right">valeur</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectPermis && colonne.map((row) => (
            <TableRow key={row}>
              <TableCell component="th" scope="row">
                {row}
              </TableCell>
              <TableCell align="right">{selectPermis[row]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}