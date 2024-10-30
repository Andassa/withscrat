import React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Papa from 'papaparse';
import TableauDetailCarre from './TableauDetailCarre';
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';



export default function ControlledAccordions(props) {
  const [expanded, setExpanded] = React.useState(false);
  const [autorisation, setAutorisation] = useState(null);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const { setCarreSelect } = props;
  const { listeCentre } = props;
  const { setListeCentre } = props;
  const { decoupeAffiche } = props;
  const { setListeCarre } = props;
  const { setNomFichier } = props;

  // useEffect(() => {
  //   if (decoupeAffiche.length != 0) {
  //     setAutorisation(true);
  //   }else{
  //     setCarreSelect([]);
  //     setListeCentre([]);
  //     setListeCarre([]); 
  //     setAutorisation(true);
  //   }
  // }, [decoupeAffiche])
  const handleError = (event) => { setAutorisation(true); }
  const handleFileUpload = (event) => {
    if (autorisation === true) {
      const file = event.target.files[0];
      setNomFichier(file.name)
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        Papa.parse(text, {
          complete: (result) => {
            const jsonArray = result.data;
            let stock = [];
            for (let i = 1; i < jsonArray.length - 1; i++) {
              let coords = [];
              let coord = { [jsonArray[0][0]]: jsonArray[i][0] };
              for (let index = 1; index < jsonArray[i].length; index++) {
                let add = jsonArray[i][index];
                coord = { ...coord, [jsonArray[0][index]]: add };
              }
              coords.push(coord);
              stock.push(coords[0]);
            }
            setListeCentre(stock);
          }
        });
      };
      reader.readAsText(file);
    } else {
      setAutorisation(true);
    }

  };

  return (
    <div style={{ padding: '10px' }}>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >

          <Typography sx={{ width: '100%', flexShrink: 0 }}>
            Listes des centres : {listeCentre.length}
          </Typography>

        </AccordionSummary>
        <AccordionDetails>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<FileUploadIcon />}
          >
            Sélectionner un fichier CSV

            {autorisation ? (
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            ) : (
              <input
                type="text"
                onClick={handleError}
                style={{ display: 'none' }}
              />
            )}

          </Button>
          {autorisation === false ? (
            <Stack sx={{ width: '100%' }} spacing={2}>
              <Alert variant="outlined" severity="error">
                veuillez séléctionner une carte 1/100.000 d'abord
              </Alert>
            </Stack>
          ) : (
            <p></p>
          )}
          <TableauDetailCarre listeCentre={listeCentre} setCarreSelect={setCarreSelect} />
        </AccordionDetails  >
      </Accordion>
    </div>
  );
}
