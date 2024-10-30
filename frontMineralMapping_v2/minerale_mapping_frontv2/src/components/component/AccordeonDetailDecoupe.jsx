import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RechercheDecoupe from './RechercheDecoupe';
// import TableauDetailPermis from './TableauDetailPermis';
import DetailDecoupe from './DetailDecoupe';

export default function ControlledAccordions(props) {
  const [expanded, setExpanded] = React.useState(false);

  const { selectDecoupe } = props;
  const { setSelectDecoupe } = props;
  const { setDecoupeAffiche } = props;

  const selected = selectDecoupe.filter(sel => sel.selectionne === 'true');



  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
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
            les cartes au 1/100.000 séléctionnnées : {selected?.length}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ padding:'50px' }} sx={{ m: 0, minWidth: 150, display: 'flex' }}>
            <RechercheDecoupe setSelectDecoupe={setSelectDecoupe} selectDecoupe={selectDecoupe} />
          </div>
          <DetailDecoupe selectDecoupe={selectDecoupe} setSelectDecoupe={setSelectDecoupe} setDecoupeAffiche={setDecoupeAffiche} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
