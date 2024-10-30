import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

import axiosInstance from '../../Lesmomdules/axiosInstance';
import AddIcon from '@mui/icons-material/Add';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import CircularProgress from '@mui/material/CircularProgress';


const filter = createFilterOptions();

export default function FreeSoloCreateOption(props) {
  const [value, setValue] = React.useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const {selectDecoupe} = props;
  const { setSelectDecoupe } = props;

  const updateSelectionne = async (indicatif) => {
    const index = decoupe.findIndex(item => item.indicatif === indicatif);
    if (index !== -1) {
      const newData = [...decoupe];
      newData[index].selectionne = 'true';
      setDecoupe(newData);
    }
    const newData = indicatif;
    newData.selectionne = 'true';
    return newData;
  };
  const updateSelectionneFalse = async (indicatif) => {
    const index = decoupe.findIndex(item => item.indicatif === indicatif);
    if (index !== -1) {
      const newData = [...decoupe];
      newData[index].selectionne = 'false';
      setDecoupe(newData);
    }
    const newData = indicatif;
    newData.selectionne = 'false';
  };

  const handleAdd = async (option) => {
    if (option.selectionne === 'false') {
      setLoadingId(option.indicatif);
      const newSelecteDecoupe = await updateSelectionne(option);
      setLoadingId(null);

      // console.log(option.indicatif);
      setSelectDecoupe([...decoupe]);
    }
    else {
      setLoadingId(option.indicatif);
      await updateSelectionneFalse(option);
      setLoadingId(null);
      console.log(option.indicatif);
      setSelectDecoupe([...decoupe]);
    }
  };

  const [decoupe, setDecoupe] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:3000/utilisateur/getDecoupe');
        const newData = response.data.map(item => ({ ...item, selectionne: 'false' }));
        setDecoupe(newData);
      }
      catch (error) {
        console.error('Erreur lors de la requête');
      }
    }
    fetchData();
  }, [])
useEffect(()=>{
  if (selectDecoupe) {
    setDecoupe(selectDecoupe);
    
  }
},[selectDecoupe]);


  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            title: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            title: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={decoupe}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.indicatif;
      }}
      renderOption={(props, option) =>
        <li {...props} onClick={() => handleAdd(option)} >{option.indicatif} - {option.nom}
          <div style={{ marginLeft: 'auto' }} >
            {loadingId === option.indicatif ? (
              <CircularProgress size={24} />
            ) : option.selectionne === 'false' ? (
              <AddIcon color="primary" />
            ) : (
              <DownloadDoneIcon color="success" />
            )}
            {/* <CircularProgress size={24}/> */}
          </div>
        </li>}
      sx={{ width: 350, height: 40 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="sélection références carte au 1/100.000" />
      )}
    />
  );
}