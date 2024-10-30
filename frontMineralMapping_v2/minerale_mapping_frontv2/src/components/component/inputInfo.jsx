import React, { useState, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axiosInstance from '../../Lesmomdules/axiosInstance';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';


export default function SelectVariants(props) {
    const {selectPermis, setSelectPermis} = props;
    const {nomPersonne, setNomPersonne} = props;
    

    const handleInputChange = (event, newInputValue) => {
        setNomPersonne(newInputValue);
    };
    
    const [typePermis, setTypePermis] = useState([]);
    const [demandeur, setDemandeur] = useState([]);

    const handleChange = (event) => {
        const permis = typePermis.find(item => item.id === event.target.value);
        setSelectPermis(permis);
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('http://localhost:3000/utilisateur/getTypePermis');
                setTypePermis(response.data);
            }
            catch (error) {
                console.error('Erreur lors de la requête');
            }
        }
        fetchData();
    }, [])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('http://localhost:3000/utilisateur/getDemandeur');
                setDemandeur(response.data);
            }
            catch (error) {
                console.error('Erreur lors de la requête');
            }
        }
        fetchData();
    }, [])

    const defaultProps = {
        options: demandeur,
        getOptionLabel: (option) => option.registre_1 + " " + option.registre_2,
    };
    const CustomPaper = styled(Paper)({
        maxHeight: '400px',  // augmenter selon vos besoins
        minWidth: '350px',
    });

    return (
        <div>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Autocomplete
                    {...defaultProps}
                    id="disable-close-on-select"
                    PaperComponent={CustomPaper}
                    freeSolo
                    inputValue={nomPersonne}
                    onInputChange={handleInputChange}
                    renderInput={(params) => (
                        <TextField
                            required
                            {...params}
                            label="demandeur"
                            variant="standard"
                        />
                    )}
                    sx={{ m: 0, minWidth: 170, display: 'flex' }}
                />
                <FormControl variant="standard" sx={{ m: 0, minWidth: 150, display: 'flex' }} style={{ marginLeft: '30px' }}>
                    <InputLabel required id="demo-simple-select-standard-label">Type de permis</InputLabel>
                    <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={selectPermis.id}
                        onChange={handleChange}
                        label="typepermis">
                        {typePermis.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.libelle} {option.typepermis}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </div>
    );
}