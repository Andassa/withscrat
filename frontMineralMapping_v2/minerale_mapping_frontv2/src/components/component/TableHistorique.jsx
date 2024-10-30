import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function createData(id, date, demandeur, typepermis, libelle, utilisateur, nom, prenom, results) {
  return {
    id,
    date,
    demandeur,
    typepermis,
    libelle,
    utilisateur,
    nomUtilisateur : nom+' '+prenom,
    results
  }
}
function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.id}</TableCell>
        <TableCell>{row.demandeur}</TableCell>
        <TableCell>{row.date}</TableCell>
        <TableCell>{row.libelle}</TableCell>
        <TableCell>{row.nom} {row.prenom}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Résultat
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Substance</TableCell>
                    <TableCell>Probabilité</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.results.map((historyRow) => {
                    const value = historyRow.prob
                    let cellStyle = {};

                    // Appliquer les styles conditionnels
                    if (value === 'élevée') {
                      // cellStyle = { backgroundColor: green[500], color: 'green' };
                      cellStyle = { color: 'green' };
                    } else if (value === 'moyenne') {
                      cellStyle = { color: 'yellow' };
                    } else if (value === 'faible') {
                      cellStyle = { color: 'orange' };
                    } else if (value === 'nulle') {
                      cellStyle = { color: 'red' };
                    }

                    return (
                      <TableRow key={historyRow.subs}>
                        <TableCell component="th" scope="row">
                          {historyRow.substance}
                        </TableCell>
                        <TableCell style={cellStyle}>{historyRow.prob}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}




export default function CollapsibleTable(props) {
  const { historiques } = props;

  const [rows, setRows] = useState([
    createData('BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo','BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo',
      [{
        subs: 'Béryllium',
        prob: 'moyenne'

      }, {
        subs: 'Béryl',
        prob: 'faible'

      }]
    ),
    createData('Rakotomanana Gilbert', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo','BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo',
      [
        {
          subs: 'Graphite',
          prob: 'élevée'

        },
        {
          subs: 'Ilménite',
          prob: 'élevée'

        },
        {
          subs: 'Or',
          prob: 'moyenne'

        },
        {
          subs: 'Palladium',
          prob: 'faible'

        },
        {
          subs: 'Rhodium',
          prob: 'faible'

        }]),
    createData('Rakotomanana Gilbert', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo','BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo',
      [
        {
          subs: 'Graphite',
          prob: 'élevée'

        },
        {
          subs: 'Ilménite',
          prob: 'élevée'

        },
        {
          subs: 'Or',
          prob: 'moyenne'

        },
        {
          subs: 'Palladium',
          prob: 'faible'

        },
        {
          subs: 'Rhodium',
          prob: 'faible'

        },
        {
          subs: 'Fer',
          prob: 'faible'

        },
        {
          subs: 'Cobalt',
          prob: 'faible'

        },
        {
          subs: 'Nickel',
          prob: 'faible'

        },
        {
          subs: 'Argent',
          prob: 'nulle'

        },
        {
          subs: 'Cuivre',
          prob: 'nulle'

        }
      ]),
  ]);

  const { demandeur } = props;
  const { permis } = props;
  const { date } = props;
  const { user } = props;
  useEffect(() => {
    if (date === 2) {

      var rows2 = [
        createData('BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo','BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo',
          [{
            subs: 'Béryllium',
            prob: 'moyenne'

          }, {
            subs: 'Béryl',
            prob: 'faible'

          }]
        ),
        createData('Rakotomanana Gilbert', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo','BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo',
          [
            {
              subs: 'Graphite',
              prob: 'élevée'

            },
            {
              subs: 'Ilménite',
              prob: 'élevée'

            },
            {
              subs: 'Or',
              prob: 'moyenne'

            },
            {
              subs: 'Palladium',
              prob: 'faible'

            },
            {
              subs: 'Rhodium',
              prob: 'faible'

            }]),
        createData('Rakotomanana Gilbert', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo','BOBA Johannot', 'PE Permis d\'exploitation', '12-06-2024', 'Randria Fanilo',
          [
            {
              subs: 'Graphite',
              prob: 'élevée'

            },
            {
              subs: 'Ilménite',
              prob: 'élevée'

            },
            {
              subs: 'Or',
              prob: 'moyenne'

            },
            {
              subs: 'Palladium',
              prob: 'faible'

            },
            {
              subs: 'Rhodium',
              prob: 'faible'

            },
            {
              subs: 'Fer',
              prob: 'faible'

            },
            {
              subs: 'Cobalt',
              prob: 'faible'

            },
            {
              subs: 'Nickel',
              prob: 'faible'

            },
            {
              subs: 'Argent',
              prob: 'nulle'

            },
            {
              subs: 'Cuivre',
              prob: 'nulle'

            }
          ])];
      setRows(rows2);
    }
  }, [date])
  // useEffect(() => {
  //   console.log(historiques)
  // }, [historiques]);
  // useEffect(() => {
  //   console.log(rows)
  // }, [rows]);
  useEffect(()=>{
    if (historiques.length!==0) {
      setRows(historiques);
    }
  },[historiques, setRows]);
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Id</TableCell>
            <TableCell>Demandeur</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Type de permis</TableCell>
            <TableCell>Utilisateur</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
