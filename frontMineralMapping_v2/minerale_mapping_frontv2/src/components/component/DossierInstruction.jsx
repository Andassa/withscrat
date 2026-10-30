import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import axiosInstance from '../../Lesmomdules/axiosInstance';

const STATUTS = ['brouillon', 'soumis', 'en_instruction', 'instruit', 'rejete', 'archive'];

export default function DossierInstruction() {
    const [dossiers, setDossiers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [commentaire, setCommentaire] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const load = async () => {
        setError('');
        try {
            const res = await axiosInstance.get('/api/instruction/dossiers');
            setDossiers(res.data.dossiers || []);
        } catch (err) {
            setError(err.response?.data?.erreur || 'Erreur chargement dossiers');
        }
    };

    useEffect(() => { load(); }, []);

    const openOne = async (id) => {
        const res = await axiosInstance.get(`/api/instruction/dossiers/${id}`);
        setSelected(res.data.dossier);
    };

    const changeStatut = async (statut) => {
        if (!selected) return;
        await axiosInstance.patch(`/api/instruction/dossiers/${selected.id}/statut`, { statut });
        setMsg(`Statut → ${statut}`);
        await openOne(selected.id);
        await load();
    };

    const addComment = async () => {
        if (!selected || !commentaire.trim()) return;
        await axiosInstance.post(`/api/instruction/dossiers/${selected.id}/commentaires`, { corps: commentaire });
        setCommentaire('');
        await openOne(selected.id);
    };

    const exportJson = async () => {
        if (!selected) return;
        const res = await axiosInstance.get(`/api/instruction/dossiers/${selected.id}/export`);
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selected.reference || 'dossier'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Dossiers d&apos;instruction
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {msg && <Alert severity="success" sx={{ mb: 1 }}>{msg}</Alert>}
            <Stack direction="row" spacing={2}>
                <List dense sx={{ width: 360, maxHeight: 480, overflow: 'auto', border: '1px solid #eee' }}>
                    {dossiers.map((d) => (
                        <ListItem key={d.id} button onClick={() => openOne(d.id)} selected={selected?.id === d.id}>
                            <ListItemText primary={d.reference} secondary={`${d.statut} · ${d.demandeur || ''}`} />
                        </ListItem>
                    ))}
                    {!dossiers.length && <ListItem><ListItemText primary="Aucun dossier" /></ListItem>}
                </List>
                <div style={{ flex: 1 }}>
                    {!selected ? (
                        <Typography color="text.secondary">Sélectionnez un dossier (créé depuis une évaluation).</Typography>
                    ) : (
                        <>
                            <Typography variant="h6">{selected.reference}</Typography>
                            <Typography variant="body2">Statut: {selected.statut} · Hist: {selected.historique_id || '—'}</Typography>
                            <TextField
                                select
                                size="small"
                                label="Changer statut"
                                value={selected.statut}
                                onChange={(e) => changeStatut(e.target.value)}
                                sx={{ mt: 1, minWidth: 220 }}
                            >
                                {STATUTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>
                            <Button sx={{ ml: 1, mt: 1 }} variant="outlined" onClick={exportJson}>Export JSON instruction</Button>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Commentaires</Typography>
                            <List dense>
                                {(selected.commentaires || []).map((c) => (
                                    <ListItem key={c.id}>
                                        <ListItemText primary={c.corps} secondary={`${c.auteur || ''} · ${c.created_at || ''}`} />
                                    </ListItem>
                                ))}
                            </List>
                            <Stack direction="row" spacing={1}>
                                <TextField size="small" fullWidth value={commentaire} onChange={(e) => setCommentaire(e.target.value)} label="Nouveau commentaire" />
                                <Button variant="contained" onClick={addComment}>Ajouter</Button>
                            </Stack>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                Pièces: {(selected.pieces || []).length}
                            </Typography>
                        </>
                    )}
                </div>
            </Stack>
        </Paper>
    );
}
