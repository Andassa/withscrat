import React, { useState, useEffect } from 'react';
import AccordeonDetailDecoupe from './component/AccordeonDetailDecoupe';
import CarteLeaflet from './component/CarteLeaflet';
import ListeSubstance from './component/listeSubstance';
import AccordeonListeCentre from './component/AccordeonListeCentre';
import Typography from '@mui/material/Typography';
import InputInfo from './component/inputInfo';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import TableResultat from './component/tableResultat';
import Pdf from './component/PdfExport';


import './../App.css';
import axiosInstance from '../Lesmomdules/axiosInstance';


function MapPage(props) {
  const [selectDecoupe, setSelectDecoupe] = useState([]);
  const [decoupeAffiche, setDecoupeAffiche] = useState([]);
  const [listeCentre, setListeCentre] = useState([]);
  const [listeCarre, setListeCarre] = useState([]);
  const [carreSelect, setCarreSelect] = useState([]);
  const [choixSubs, setChoixSubs] = useState([]);
  const [nomPersonne, setNomPersonne] = useState('');
  const [selectPermis, setSelectPermis] = useState('');
  const [confirmation, setConfirmation] = useState({});
  const [resultat, setResultat] = useState([]);
  const [nomFichier, setNomFichier] = useState('');

  const [misokatra, setMisokatra] = React.useState(false);

  const handleClickOpenModal = () => {
    setMisokatra(true);
  };
  const handleCloseModal = () => {
    setMisokatra(false);
  };
  const [etatPermis, setEtatPermis] = useState((<div></div>))

  const [ouvert, setOuvert] = React.useState(false);

  /////formation de carrée venant des listes de centre////
  useEffect(() => {
    if (listeCentre) {
      if (listeCentre.length > 0) {
        const donnees = { 'centre': listeCentre };
        fetch('http://localhost:3000/formeCarre', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ donnees: donnees })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Erreur lors de l\'envoi du tableau JSON');
            }
            return response.json();
          })
          .then(data => {
            setListeCarre(data);
          })
          .catch(error => {
            console.error('Erreur :', error);
          });
      }
    }
  }, [listeCentre])
  ///// fin formation de carre///

  /////debut verification de valeur////
  const handelConfirmation = () => {
    if (nomPersonne.length === 0) {
      setConfirmation({ error: ' nom de demandeur vide' })
      return confirmation;
    }
    if (selectPermis.length === 0) {
      setConfirmation({ error: ' type de permis vide' })
      return confirmation;
    }
    if (listeCarre.length === 0) {
      setConfirmation({ error: ' liste de carré vide' });
      return confirmation;
    }
    // if (listeCarre.length > 0) {
    //   for (let i = 0; i < listeCarre.length; i++) {
    //     if (listeCarre[i]['etat'] === 1) {
    //       setConfirmation({ error: ' des carrés hors decoupe' });
    //       return confirmation;
    //     }
    //   }
    // }
    if (choixSubs.length === 0) {
      setConfirmation({ error: ' pas de substance ' })
      return confirmation;
    }
    setConfirmation({ valide: 'confirmation valide' })
    return confirmation;
  }
  /////fin verification de valeur////

  //// debut pour afficher messages d' erreurs
  const [state, setState] = React.useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const { vertical, horizontal, open } = state;
  const handleClose = () => {
    setState({ ...state, open: false });
  };
  //// fin afficher messages d' erreurs

  //// debut envoie de données vers la base
  useEffect(() => {
    /////if hasOwnProperty error affichage error 
    if (confirmation.hasOwnProperty('error')) {
      async function handleClick(newState) {
        setState({ ...newState, open: true });
      };
      handleClick({ vertical: 'top', horizontal: 'center' });
    } if (confirmation.hasOwnProperty('valide')) { /// else envoie vers la backend 
      async function handleOuvert() {
        setOuvert(true);
      }
      async function handleFerme() {
        setOuvert(false);
      }
      handleOuvert();
      const donneesTableau = { 'nomPersonne': nomPersonne, 'selectPermis': selectPermis.id, 'listeCarre': listeCarre, 'choixSubs': choixSubs };
      axiosInstance.post('http://localhost:3000/utilisateur/getDonneDemande', { donneesTableau })
        .then(response => {
          handleFerme();
          console.log(response.data);
          setResultat(response.data);
        })
        .catch(error => {
          console.error('Erreur :', error);
        });

    }
  }, [confirmation]);
  //// fin envoie de données vers la base 
  useEffect(() => {
    if (resultat.length !== 0) {
      handleClickOpenModal();
    }
  }, [resultat])


  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));
  const [selectedValue, setSelectedValue] = useState('100');
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const boutton = (
    <React.Fragment>
      <Button variant="contained" endIcon={<SendIcon />} size='large'
        onClick={handelConfirmation}
      // onClick={handleClick({ vertical: 'top', horizontal: 'center' })}
      >
        Envoyer
      </Button>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={ouvert}
        onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <BootstrapDialog
        onClose={handleCloseModal}
        aria-labelledby="customized-dialog-title"
        open={misokatra}
        maxWidth="md"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Les Résultats de l'évaluation
          <Pdf nomPersonne={nomPersonne} selectPermis={selectPermis} selectedValue={selectedValue} listeCarre={listeCarre} choixSubs={choixSubs} resultat={resultat} nomFichier={nomFichier} />

        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseModal}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ flexGrow: 1 }} style={{ height: '500px', width: '500px' }}>
            <TableResultat selectedValue={selectedValue} resultat={resultat} />
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );

  const { taille } = props;
  const [style1, setStyle1] = useState({
    width: "57vw", height: "90vh", position: "fixed"
  })
  const [style2, setStyle2] = useState({
    width: "40vw", height: '100vh', overflowY: 'scroll', marginLeft: '57vw'
  })
  useEffect(() => {
    if (taille === 0) {
      setStyle1({ width: "45vw", height: "90vh", position: "fixed" })
      setStyle2({ width: "40vw", height: '100vh', overflowY: 'scroll', marginLeft: '45vw' })
    }
  }, [taille])
  useEffect(() => {
    if (selectPermis.id === 3 || selectPermis.id === 2) {
      setEtatPermis(
        <FormControl style={{ marginTop: '20px' }}>
          <FormLabel id="demo-row-radio-buttons-group-label"></FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            value={selectedValue}
            onChange={handleChange}
            required
          >
            <FormControlLabel value='5' control={<Radio />} label="Octroi" />
            <FormControlLabel value='10' control={<Radio />} label="Renouvellement" />
          </RadioGroup>
        </FormControl>
      )
    } else {
      setEtatPermis((<div></div>))
      setSelectedValue('100')

    }
  }, [selectPermis, selectedValue])

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", width: "97vw", height: "100vh" }} >
        <div style={style1}>
          <CarteLeaflet decoupeAffiche={decoupeAffiche} listeCarre={listeCarre} carreSelect={carreSelect} />
        </div>
        <div style={style2}>
          <div style={{ padding: "15px" }} >
            <Typography variant="h5" gutterBottom style={{ color: 'blue' }} textAlign="center">
              Les informations sur le permis
            </Typography>
            <hr />
            <div style={{ padding: '30px' }}>
              <InputInfo nomPersonne={nomPersonne} setNomPersonne={setNomPersonne} selectPermis={selectPermis} setSelectPermis={setSelectPermis} />
              {etatPermis}
            </div>
          </div>
          {/* <AccordeonDetailDecoupe selectDecoupe={selectDecoupe} setSelectDecoupe={setSelectDecoupe} setDecoupeAffiche={setDecoupeAffiche} /> */}
          <AccordeonListeCentre listeCentre={listeCentre} setListeCarre={setListeCarre} setListeCentre={setListeCentre} setCarreSelect={setCarreSelect} decoupeAffiche={decoupeAffiche} setNomFichier={setNomFichier} />
          <ListeSubstance setChoixSubs={setChoixSubs} />
          <div style={{ float: 'right' }} >
            {boutton}
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={open}
              onClose={handleClose}
              message={confirmation.error}
              key={vertical + horizontal}
            >
              <Alert
                // onClose={handleClose}
                severity="error"
                variant="filled"
                sx={{ width: '100%', padding: '25px' }}
              >
                ERREUR : {confirmation.error}
              </Alert>
            </ Snackbar>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
