import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableauDetailPermis from './TableauDetailPermis';

export default function ControlledAccordions(props) {
  const [expanded, setExpanded] = React.useState(false);

  const { selectPermis } = props;


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
            Détails du permis seléctionné :
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          
            <TableauDetailPermis selectPermis={selectPermis} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
