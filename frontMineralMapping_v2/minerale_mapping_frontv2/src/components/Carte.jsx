import React, { useState, useEffect, useMemo } from 'react';
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
import AnalyseKrigeage from './component/AnalyseKrigeage';
import AssistantChecklist from './component/AssistantChecklist';
import ConflitsPanel from './component/ConflitsPanel';
import ScenarioSuggestions from './component/ScenarioSuggestions';
import './../App.css';
import axiosInstance from '../Lesmomdules/axiosInstance';

function MapPage(props) {
  const [selectDecoupe] = useState([]);
  const [decoupeAffiche] = useState([]);
  const [listeCentre, setListeCentre] = useState([]);
  const [listeCarre, setListeCarre] = useState([]);
  const [carreSelect, setCarreSelect] = useState([]);
  const [choixSubs, setChoixSubs] = useState([]);
  const [nomPersonne, setNomPersonne] = useState('');
  const [selectPermis, setSelectPermis] = useState('');
  const [confirmation, setConfirmation] = useState({});
  const [resultat, setResultat] = useState([]);
  const [meta, setMeta] = useState(null);
  const [conflits, setConflits] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [instructionRef, setInstructionRef] = useState(null);
  const [nomFichier, setNomFichier] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [misokatra, setMisokatra] = useState(false);
  const [etatPermis, setEtatPermis] = useState(<div></div>);
  const [ouvert, setOuvert] = useState(false);
  const [selectedValue, setSelectedValue] = useState('100');
  const [state, setState] = useState({ open: false, vertical: 'top', horizontal: 'center' });
  const { vertical, horizontal, open } = state;

  const donneesTableau = useMemo(() => ({
    nomPersonne,
    selectPermis: selectPermis?.id,
    listeCarre,
    choixSubs,
  }), [nomPersonne, selectPermis, listeCarre, choixSubs]);

  const localChecks = useMemo(() => {
    const hors = (listeCarre || []).filter((c) => Number(c.etat) === 1);
    return [
      { id: 'demandeur', ok: Boolean(nomPersonne?.trim()), message: 'Nom du demandeur renseigné', blocking: true },
      { id: 'permis', ok: Boolean(selectPermis?.id), message: 'Type de permis sélectionné', blocking: true },
      { id: 'carres', ok: listeCarre.length > 0, message: `Au moins un carré (${listeCarre.length})`, blocking: true },
      { id: 'hors_decoupe', ok: hors.length === 0, message: hors.length ? `${hors.length} carré(s) hors découpe` : 'Tous les carrés dans la découpe', blocking: true },
      { id: 'substances', ok: choixSubs.length > 0, message: `Au moins une substance (${choixSubs.length})`, blocking: true },
    ];
  }, [nomPersonne, selectPermis, listeCarre, choixSubs]);

  useEffect(() => {
    if (listeCentre?.length > 0) {
      axiosInstance.post('/formeCarre', { donnees: { centre: listeCentre, decoupe: selectDecoupe } })
        .then((response) => setListeCarre(response.data))
        .catch(() => setConfirmation({ error: 'Impossible de former les carrés' }));
    }
  }, [listeCentre, selectDecoupe]);

  const handelConfirmation = () => {
    const fail = localChecks.find((c) => c.blocking && !c.ok);
    if (fail) {
      setConfirmation({ error: fail.message });
      return;
    }
    if (conflits?.bloquant) {
      setConfirmation({ error: 'Conflits bloquants détectés — corrigez la zone ou justifiez en instruction' });
      return;
    }
    setConfirmation({ valide: 'confirmation valide' });
  };

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(confirmation, 'error')) {
      setState({ vertical: 'top', horizontal: 'center', open: true });
    }
    if (Object.prototype.hasOwnProperty.call(confirmation, 'valide')) {
      setOuvert(true);
      axiosInstance.post('/utilisateur/getDonneDemande', { donneesTableau })
        .then(async (response) => {
          setOuvert(false);
          const payload = response.data;
          const rows = payload.results || [];
          setResultat(rows);
          setMeta(payload.meta || null);
          setConflits(payload.conflits || null);
          setSuggestions(payload.suggestions || null);
          setDossier(payload.dossier || null);
          try {
            const created = await axiosInstance.post('/api/instruction/dossiers', {
              demandeur: nomPersonne,
              typepermis: selectPermis?.id,
              historiqueId: payload.meta?.historiqueId,
              payload: {
                results: rows,
                meta: payload.meta,
                conflits: payload.conflits,
                suggestions: payload.suggestions,
              },
            });
            setInstructionRef(created.data.dossier?.reference || null);
          } catch (_) {
            setInstructionRef(null);
          }
          setSuccessMsg(payload.conflits?.bloquant
            ? 'Évalué — conflits BLOQUANTS (dossier créé en brouillon)'
            : 'Évaluation terminée — dossier d\'instruction créé');
          setMisokatra(true);
        })
        .catch((error) => {
          setOuvert(false);
          setConfirmation({ error: error.response?.data?.error || 'Erreur lors de l\'évaluation' });
        });
    }
  }, [confirmation]);

  const onScenarioResult = (data) => {
    setResultat(data.results || []);
    setMeta(data.meta || null);
    setConflits(data.conflits || null);
    setSuggestions(data.suggestions || null);
    setSuccessMsg('Scénario affiché (non persisté)');
    setMisokatra(true);
  };

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  }));

  const boutton = (
    <React.Fragment>
      <Button variant="contained" endIcon={<SendIcon />} size="large" onClick={handelConfirmation}>
        Envoyer / Évaluer
      </Button>
      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={ouvert}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <BootstrapDialog onClose={() => setMisokatra(false)} open={misokatra} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Résultats & dossier
          {instructionRef && (
            <Typography variant="caption" display="block">Instruction: {instructionRef}</Typography>
          )}
          <Pdf
            nomPersonne={nomPersonne}
            selectPermis={selectPermis}
            selectedValue={selectedValue}
            listeCarre={listeCarre}
            choixSubs={choixSubs}
            resultat={resultat}
            nomFichier={nomFichier}
            dossier={dossier}
            conflits={conflits}
            meta={meta}
          />
        </DialogTitle>
        <IconButton aria-label="close" onClick={() => setMisokatra(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {conflits?.alerte && (
            <Alert severity={conflits.bloquant ? 'error' : 'warning'} sx={{ mb: 1 }}>{conflits.message}</Alert>
          )}
          {suggestions?.suggestions?.length > 0 && (
            <Alert severity="info" sx={{ mb: 1 }}>
              Suggestions: {suggestions.suggestions.slice(0, 8).map((s) => s.nom).join(', ')}
            </Alert>
          )}
          <Box sx={{ minHeight: 420 }}>
            <TableResultat selectedValue={selectedValue} resultat={resultat} meta={meta} />
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );

  const { taille } = props;
  const [style1, setStyle1] = useState({ width: '57vw', height: '90vh', position: 'fixed' });
  const [style2, setStyle2] = useState({ width: '40vw', height: '100vh', overflowY: 'scroll', marginLeft: '57vw' });
  useEffect(() => {
    if (taille === 0) {
      setStyle1({ width: '45vw', height: '90vh', position: 'fixed' });
      setStyle2({ width: '40vw', height: '100vh', overflowY: 'scroll', marginLeft: '45vw' });
    }
  }, [taille]);

  useEffect(() => {
    if (selectPermis.id === 3 || selectPermis.id === 2) {
      setEtatPermis(
        <FormControl style={{ marginTop: '20px' }}>
          <FormLabel />
          <RadioGroup row value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}>
            <FormControlLabel value="5" control={<Radio />} label="Octroi" />
            <FormControlLabel value="10" control={<Radio />} label="Renouvellement" />
          </RadioGroup>
        </FormControl>
      );
    } else {
      setEtatPermis(<div></div>);
      setSelectedValue('100');
    }
  }, [selectPermis, selectedValue]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '97vw', height: '100vh' }}>
      <div style={style1}>
        <CarteLeaflet
          decoupeAffiche={decoupeAffiche}
          listeCarre={listeCarre}
          carreSelect={carreSelect}
          conflitsGeoms={conflits?.conflits || []}
        />
      </div>
      <div style={style2}>
        <div style={{ padding: '15px' }}>
          <Typography variant="h5" gutterBottom style={{ color: 'blue' }} textAlign="center">
            Aide à la décision — permis
          </Typography>
          <hr />
          <div style={{ padding: '20px' }}>
            <InputInfo nomPersonne={nomPersonne} setNomPersonne={setNomPersonne} selectPermis={selectPermis} setSelectPermis={setSelectPermis} />
            {etatPermis}
          </div>
        </div>
        <AccordeonListeCentre listeCentre={listeCentre} setListeCarre={setListeCarre} setListeCentre={setListeCentre} setCarreSelect={setCarreSelect} decoupeAffiche={decoupeAffiche} setNomFichier={setNomFichier} />
        <ListeSubstance setChoixSubs={setChoixSubs} />
        <div style={{ padding: '0 12px 80px' }}>
          <AssistantChecklist donneesTableau={donneesTableau} localChecks={localChecks} />
          <ConflitsPanel listeCarre={listeCarre} conflits={conflits} onConflits={setConflits} />
          <ScenarioSuggestions donneesTableau={donneesTableau} onScenarioResult={onScenarioResult} />
          <AnalyseKrigeage choixSubs={choixSubs} />
        </div>
        <div style={{ float: 'right', padding: 12 }}>
          {boutton}
          <Snackbar open={open} onClose={() => setState({ ...state, open: false })} anchorOrigin={{ vertical, horizontal }}>
            <Alert severity="error" variant="filled">ERREUR : {confirmation.error}</Alert>
          </Snackbar>
          <Snackbar open={Boolean(successMsg)} autoHideDuration={5000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity="success" variant="filled" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
