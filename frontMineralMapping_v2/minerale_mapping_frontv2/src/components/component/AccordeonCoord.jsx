import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableauCoord from './TableCoordonnees';

export default function ControlledAccordions(props) {
  const [expanded, setExpanded] = React.useState(false);

  const { coordonnees } = props;
  const coordonnes = coordonnees;
  var taille = 0;
  if (coordonnees) {
    taille = coordonnes.length;
  }
  const message =' '+ taille+' points'

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div style={{ padding: '10px' }}>
      <Accordion  expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography sx={{ width: '100%', flexShrink: 0 }}>
            Liste des points séléctionnés :{message}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
            <TableauCoord coordonnes={coordonnes} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
