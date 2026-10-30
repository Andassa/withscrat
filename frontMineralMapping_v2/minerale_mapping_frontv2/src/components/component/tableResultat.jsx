import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import axiosInstance from '../../Lesmomdules/axiosInstance';

const noteLabel = (res) => {
    if (res === 1) return 'nulle';
    if (res === 2) return 'faible';
    if (res === 3) return 'moyenne';
    if (res === 4) return 'élevée';
    return 'indeterminee';
};

const indiceLabel = (indice) => {
    if (indice === 1) return 'nulle';
    if (indice === 2 || indice === 3) return 'moyenne';
    if (indice === 4) return 'élevée';
    return 'indeterminee';
};

function Row({ element, historiqueId }) {
    const [open, setOpen] = useState(false);
    const [noteGeo, setNoteGeo] = useState(String(element.result || ''));
    const [comment, setComment] = useState('');
    const [saved, setSaved] = useState('');
    const litho = element.label || noteLabel(Number(element.result));
    const indice = indiceLabel(Number(element.presenceIndice ?? element.probIndice));
    const colorFor = (value) => {
        if (value === 'élevée') return 'green';
        if (value === 'moyenne') return 'rgb(213, 214, 3)';
        if (value === 'faible') return 'orange';
        if (value === 'nulle') return 'red';
        return undefined;
    };

    const sendFeedback = async () => {
        await axiosInstance.post('/api/validation/feedback', {
            historiqueId,
            substance: element.subs,
            noteSysteme: Number(element.result),
            noteGeologue: Number(noteGeo),
            commentaire: comment,
        });
        setSaved('Feedback enregistré');
    };

    return (
        <>
            <TableRow hover>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{element.subs}</TableCell>
                <TableCell style={{ color: colorFor(litho) }}>{litho}</TableCell>
                <TableCell style={{ color: colorFor(indice) }}>{indice}</TableCell>
                <TableCell>{element.path || '—'}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 1 }}>
                            <Typography variant="subtitle2">Justification</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {element.reason || 'Règles géologiques appliquées.'}
                            </Typography>
                            <Typography variant="body2">Bases: {(element.basesMatched || []).join(', ') || '—'}</Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>Validation géologue</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <TextField size="small" type="number" label="Note géologue" value={noteGeo} onChange={(e) => setNoteGeo(e.target.value)} sx={{ width: 140 }} />
                                <TextField size="small" label="Commentaire" value={comment} onChange={(e) => setComment(e.target.value)} sx={{ flex: 1 }} />
                                <Button size="small" variant="outlined" onClick={sendFeedback}>Valider</Button>
                            </Stack>
                            {saved && <Typography variant="caption" color="success.main">{saved}</Typography>}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function StickyHeadTable({ selectedValue, resultat, meta }) {
    const [page, setPage] = useState(0);
    const [tab, setTab] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (!Array.isArray(resultat) || !resultat.length) {
            setTab([]);
            return;
        }
        const sorted = [...resultat].sort((a, b) => Number(b.result) - Number(a.result));
        const nb = parseInt(selectedValue, 10);
        setTab(Number.isFinite(nb) && nb < sorted.length ? sorted.slice(0, nb) : sorted);
    }, [resultat, selectedValue]);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                    Note lithologie = règles géologiques. Indices = familles touchées (pas une proba).
                </Typography>
                {meta?.historiqueId != null && (
                    <Typography variant="caption">Historique #{meta.historiqueId}</Typography>
                )}
            </Box>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Substance</TableCell>
                            <TableCell>Lithologie</TableCell>
                            <TableCell>Présence indices</TableCell>
                            <TableCell>Chemin</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tab.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <Row key={row.subs} element={row} historiqueId={meta?.historiqueId} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={tab.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
            />
        </Paper>
    );
}
