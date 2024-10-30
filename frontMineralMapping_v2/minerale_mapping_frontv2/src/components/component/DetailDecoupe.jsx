import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import DeleteIcon from '@mui/icons-material/Delete';


export default function AccessibleTable(props) {
    const { selectDecoupe } = props;
    const { setSelectDecoupe } = props; //////
    const { setDecoupeAffiche } = props;
    const [choixAffiche, setChoixAffiche] = useState([]);
    async function changeAffichageCarte(indicatif, nom) {
        // setFormData({ ...formData, 'indicatif': indicatif, 'nom': nom });
        setChoixAffiche([{ 'indicatif': indicatif, 'nom': nom }]);
    }
    useEffect(()=>{
        const resultatsVrais = selectDecoupe.filter(function (element) {
            return element.selectionne === 'true';
        });
        setChoixAffiche(resultatsVrais);
    },[selectDecoupe]);
    async function showAllCarte() {
        // setChoixAffiche([...selectDecoupe]);
        const resultatsVrais = selectDecoupe.filter(function (element) {
            return element.selectionne === 'true';
        });
        setChoixAffiche(resultatsVrais);
    };
    async function deleteSelectDecoupe(indicatif) {
        const index = selectDecoupe.findIndex(item => item.indicatif === indicatif);
        if (index !== -1) {
            const newData = [...selectDecoupe];
            newData[index].selectionne = 'false';
            setSelectDecoupe(newData);
        }
        const index2 = choixAffiche.findIndex(item => item.indicatif === indicatif);
        if (index2 !== -1) {
            const newData = choixAffiche.filter(item => item.indicatif !== indicatif);
            setChoixAffiche(newData);
        }
    }
    useEffect(() => {
        if (choixAffiche) {
            if (choixAffiche.length === 0) {
                setDecoupeAffiche([]);
            } else {

                fetch('http://localhost:3000/testTableau', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tableau: choixAffiche })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erreur lors de l\'envoi du tableau JSON');
                        }
                        return response.json();
                    })
                    .then(data => {
                        const stock = [...data];
                        for (let i = 0; i < stock.length; i++) {
                            stock[i].st_asgeojson = JSON.parse(data[i].st_asgeojson);
                        }
                        const stock1 = [...stock];
                        for (let i = 0; i < stock1.length; i++) {
                            stock1[i].st_asgeojson.coordinates = stock[i]['st_asgeojson']['coordinates'][0][0].map(coords => { return [coords[1], coords[0]] });
                        }
                        setDecoupeAffiche(stock1);
                    })
                    .catch(error => {
                        console.error('Erreur :', error);
                    });
            }
        }
    }, [choixAffiche, setDecoupeAffiche]);




    return (
        <TableContainer component={Paper} style={{ maxHeight: '300px' }}>
            <Table sx={{ minWidth: 300 }} aria-label="caption table">
                <caption><Link href='#' onClick={showAllCarte} underline="hover">
                    {'Afficher tout'}
                </Link></caption>
                <TableBody>
                    {selectDecoupe?.map((row) => (
                        row['selectionne'] === 'true' ? (
                            <TableRow key={row['indicatif']}>
                                <TableCell component="th" scope="row">
                                    {row['indicatif']}
                                </TableCell>
                                <TableCell>
                                    {row['nom']}
                                </TableCell>
                                <TableCell align="right">
                                    <Link href='#' onClick={() => changeAffichageCarte(row['indicatif'], row['nom'])} underline="hover">
                                        {'Afficher sur la carte'}
                                    </Link>
                                </TableCell>
                                <TableCell align="right">
                                    <Link href="#" onClick={() => deleteSelectDecoupe(row['indicatif'])}>
                                        <DeleteIcon sx={{ color: 'red' }} />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ) : null

                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}