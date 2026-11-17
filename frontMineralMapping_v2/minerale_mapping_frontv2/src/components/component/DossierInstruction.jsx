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
import Chip from '@mui/material/Chip';
import axiosInstance from '../../Lesmomdules/axiosInstance';

const STATUTS = ['brouillon', 'soumis', 'en_instruction', 'instruit', 'rejete', 'archive'];

function typeColor(type) {
    if (type === 'validation') return 'secondary';
    if (type === 'statut') return 'primary';
    if (type === 'evaluation') return 'success';
    if (type === 'piece') return 'warning';
    return 'default';
}

export default function DossierInstruction() {
    const [dossiers, setDossiers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [timeline, setTimeline] = useState([]);
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
        const [res, tl] = await Promise.all([
            axiosInstance.get(`/api/instruction/dossiers/${id}`),
            axiosInstance.get(`/api/instruction/dossiers/${id}/timeline`),
        ]);
        setSelected(res.data.dossier);
        setTimeline(tl.data.timeline || []);
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

    const goValidate = () => {
        if (!selected?.historique_id) return;
        window.location.href = `/admin/validation?historiqueId=${encodeURIComponent(selected.historique_id)}`;
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Dossiers d&apos;instruction
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Une demande = un dossier avec timeline (création, évaluation, validation, statut, pièces).
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {msg && <Alert severity="success" sx={{ mb: 1 }}>{msg}</Alert>}
            <Stack direction="row" spacing={2}>
                <List dense sx={{ width: 360, maxHeight: 520, overflow: 'auto', border: '1px solid #eee' }}>
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
                            <Typography variant="body2">
                                Statut: {selected.statut} · Hist: {selected.historique_id || '—'}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                <TextField
                                    select
                                    size="small"
                                    label="Changer statut"
                                    value={selected.statut}
                                    onChange={(e) => changeStatut(e.target.value)}
                                    sx={{ minWidth: 220 }}
                                >
                                    {STATUTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </TextField>
                                <Button variant="outlined" onClick={exportJson}>Export JSON</Button>
                                {selected.historique_id && (
                                    <Button variant="contained" onClick={goValidate}>Valider géologue</Button>
                                )}
                            </Stack>

                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Timeline</Typography>
                            <List dense sx={{ maxHeight: 280, overflow: 'auto', border: '1px solid #eee', mb: 2 }}>
                                {timeline.map((item) => (
                                    <ListItem key={item.id} alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip size="small" label={item.type} color={typeColor(item.type)} />
                                                    <span>{item.label}</span>
                                                </Stack>
                                            }
                                            secondary={`${item.at ? new Date(item.at).toLocaleString() : ''} · ${item.actor || ''}`}
                                        />
                                    </ListItem>
                                ))}
                                {!timeline.length && (
                                    <ListItem><ListItemText primary="Aucun événement" /></ListItem>
                                )}
                            </List>

                            <Typography variant="subtitle2">Commentaires</Typography>
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
