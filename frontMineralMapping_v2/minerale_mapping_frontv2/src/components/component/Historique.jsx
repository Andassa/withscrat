import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import axiosInstance from '../../Lesmomdules/axiosInstance';

import TableHistorique from './TableHistorique';
import { useEffect } from 'react';

export default function SelectOtherProps() {
    const [demandeur, setDemandeur] = React.useState('');
    const [permis, setPermis] = React.useState('');
    const [date, setDate] = React.useState('');
    const [user, setUser] = React.useState('');
    const [historiques, setHistoriques]= React.useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('http://localhost:3000/admin/getHistoriques');
                setHistoriques(response.data);
            }
            catch (error) {
                console.error('Erreur lors de la requête');
            }
        }
        fetchData();
    }, []);
    useEffect(()=>{
        console.log(historiques)
    },[historiques])

    const handleChange1 = (event) => {
        setDemandeur(event.target.value);
    };
    const handleChange2 = (event) => {
        setPermis(event.target.value);
    };
    const handleChange3 = (event) => {
        setDate(event.target.value);
    };
    const handleChange4 = (event) => {
        setUser(event.target.value);
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Tableau de bord
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="demo-simple-select-autowidth-label">Demandeur</InputLabel>
                <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={demandeur}
                    onChange={handleChange1}
                    autoWidth
                    label="Demandeur"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>BOBA Johannot</MenuItem>
                    <MenuItem value={0}>Rakotomanana Gilbert</MenuItem>
                    <MenuItem value={21}>PAM Madagascar S.A</MenuItem>
                    <MenuItem value={22}>BLUE CRYSTAL S.A.R.L.</MenuItem>
                    <MenuItem value={22}>RAVONIARIZAFY Merline</MenuItem>
                    <MenuItem value={22}>PR GLOBAL RESOURCES S.A.R.L.U</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="demo-simple-select-autowidth-label">Type de Permis</InputLabel>
                <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={permis}
                    onChange={handleChange2}
                    autoWidth
                    label="Type de Permis"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>PE Permis d'exploitation</MenuItem>
                    <MenuItem value={21}>PR Premis de recherche</MenuItem>
                    <MenuItem value={1}>PREA Permis reservé aux petits exploitant artisanaux</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="demo-simple-select-autowidth-label">Date</InputLabel>
                <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={date}
                    onChange={handleChange3}
                    autoWidth
                    label="Date"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={2}>12-06-2024</MenuItem>
                    <MenuItem value={21}>11-06-2024</MenuItem>
                    <MenuItem value={22}>10-06-2024</MenuItem>
                    <MenuItem value={22}>05-06-2024</MenuItem>
                    <MenuItem value={22}>04-06-2024</MenuItem>
                    <MenuItem value={22}>03-06-2024</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="demo-simple-select-autowidth-label">Utilisateur</InputLabel>
                <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={user}
                    onChange={handleChange4}
                    autoWidth
                    label="Utilisateur"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={3}>Randria Fanilo </MenuItem>
                    <MenuItem value={21}>Raholisoa David</MenuItem>
                    <MenuItem value={22}>Rakotoarisoa Mihary</MenuItem>
                    <MenuItem value={22}>Rabe zo</MenuItem>
                    <MenuItem value={22}>Rakotoarimanana Jerry</MenuItem>
                </Select>
            </FormControl>
            <TableHistorique demandeur={demandeur} permis={permis} date={date} user={user} historiques={historiques} />
        </div>
    );
}
