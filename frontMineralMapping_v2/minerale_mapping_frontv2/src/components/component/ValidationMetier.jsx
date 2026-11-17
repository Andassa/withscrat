import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import axiosInstance from '../../Lesmomdules/axiosInstance';

function readQueryHistoriqueId() {
    try {
        return new URLSearchParams(window.location.search).get('historiqueId') || '';
    } catch {
        return '';
    }
}

export default function ValidationMetier() {
    const [report, setReport] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [historiques, setHistoriques] = useState([]);
    const [draft, setDraft] = useState(null);
    const [form, setForm] = useState({
        historiqueId: readQueryHistoriqueId(),
        substance: '',
        noteSysteme: '',
        noteGeologue: '',
        commentaire: '',
    });
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const loadFeedback = useCallback(async () => {
        const res = await axiosInstance.get('/api/validation/feedback');
        setFeedback(res.data.feedback || []);
        setStats(res.data.stats || null);
    }, []);

    const loadHistoriques = useCallback(async () => {
        const res = await axiosInstance.get('/api/validation/historiques?limit=40');
        setHistoriques(res.data.historiques || []);
    }, []);

    const loadDraft = useCallback(async (historiqueId) => {
        if (!historiqueId) {
            setDraft(null);
            return;
        }
        setErr('');
        try {
            const res = await axiosInstance.get(`/api/validation/from-historique/${historiqueId}`);
            const d = res.data.draft;
            setDraft(d);
            setForm((prev) => ({
                ...prev,
                historiqueId: String(d.historiqueId),
                substance: d.substances?.[0]?.substance || '',
                noteSysteme: d.substances?.[0]?.noteSysteme ?? '',
                noteGeologue: prev.noteGeologue,
            }));
        } catch (e) {
            setDraft(null);
            setErr(e?.response?.data?.erreur || 'Impossible de charger cet historique');
        }
    }, []);

    useEffect(() => {
        loadFeedback().catch(() => {});
        loadHistoriques().catch(() => {});
        const qid = readQueryHistoriqueId();
        if (qid) loadDraft(qid).catch(() => {});
    }, [loadFeedback, loadHistoriques, loadDraft]);

    useEffect(() => {
        if (!draft?.substances?.length || !form.substance) return;
        const match = draft.substances.find(
            (s) => String(s.substance).toLowerCase() === String(form.substance).toLowerCase()
        );
        if (match && match.noteSysteme != null) {
            setForm((prev) => ({ ...prev, noteSysteme: match.noteSysteme }));
        }
    }, [form.substance, draft]);

    const substanceOptions = useMemo(
        () => draft?.substances || [],
        [draft]
    );

    const runFixtures = async () => {
        const res = await axiosInstance.get('/api/validation/fixtures');
        setReport(res.data);
    };

    const save = async () => {
        setMsg('');
        setErr('');
        try {
            await axiosInstance.post('/api/validation/feedback', {
                historiqueId: form.historiqueId,
                substance: form.substance,
                noteSysteme: Number(form.noteSysteme),
                noteGeologue: Number(form.noteGeologue),
                commentaire: form.commentaire,
            });
            setMsg('Feedback géologue enregistré');
            setForm((prev) => ({ ...prev, noteGeologue: '', commentaire: '' }));
            await loadFeedback();
        } catch (e) {
            setErr(e?.response?.data?.erreur || 'Enregistrement impossible');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Validation métier ScoreEngine
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sélectionnez une évaluation historique, puis saisissez la note géologue. Plus besoin de retaper l&apos;ID à la main.
            </Typography>
            <Button variant="contained" onClick={runFixtures}>Lancer fixtures</Button>
            {report && (
                <Alert severity={report.failed ? 'warning' : 'success'} sx={{ mt: 2 }}>
                    {report.passed}/{report.total} OK · {report.failed} échec(s)
                </Alert>
            )}
            {report?.results && (
                <Table size="small" sx={{ mt: 1 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>OK</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {report.results.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{r.id}</TableCell>
                                <TableCell>{r.ok ? 'oui' : 'non'}</TableCell>
                                <TableCell>{r.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>Feedback géologue</Typography>
            {stats && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    Accords: {stats.accords}/{stats.total} ({stats.tauxAccordPct ?? '—'}%)
                </Alert>
            )}
            {msg && <Alert severity="success" sx={{ mb: 1 }}>{msg}</Alert>}
            {err && <Alert severity="error" sx={{ mb: 1 }}>{err}</Alert>}
            <Stack spacing={1} sx={{ maxWidth: 520, mb: 2 }}>
                <TextField
                    select
                    size="small"
                    label="Évaluation historique"
                    value={form.historiqueId}
                    onChange={(e) => {
                        const id = e.target.value;
                        setForm((prev) => ({ ...prev, historiqueId: id, substance: '', noteSysteme: '' }));
                        loadDraft(id);
                    }}
                >
                    <MenuItem value="">Choisir…</MenuItem>
                    {historiques.map((h) => (
                        <MenuItem key={h.id} value={String(h.id)}>
                            #{h.id} · {h.demandeur || '—'} · {(h.substances || []).slice(0, 3).join(', ')}
                        </MenuItem>
                    ))}
                </TextField>
                {draft && (
                    <Alert severity="success" sx={{ py: 0.5 }}>
                        {draft.demandeur || 'Demandeur n/a'} · {draft.typepermis || '—'} · {draft.utilisateur || ''}
                    </Alert>
                )}
                <TextField
                    select
                    size="small"
                    label="Substance"
                    value={form.substance}
                    disabled={!substanceOptions.length}
                    onChange={(e) => setForm({ ...form, substance: e.target.value })}
                >
                    {substanceOptions.map((s) => (
                        <MenuItem key={s.substance} value={s.substance}>
                            {s.substance} (système: {s.noteSysteme ?? '?'} · {s.labelSysteme || ''})
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    size="small"
                    type="number"
                    label="Note système (auto)"
                    value={form.noteSysteme}
                    InputProps={{ readOnly: true }}
                />
                <TextField
                    size="small"
                    type="number"
                    label="Note géologue (1-4)"
                    value={form.noteGeologue}
                    onChange={(e) => setForm({ ...form, noteGeologue: e.target.value })}
                />
                <TextField
                    size="small"
                    label="Commentaire"
                    value={form.commentaire}
                    onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                />
                <Button
                    variant="outlined"
                    onClick={save}
                    disabled={!form.historiqueId || !form.substance || !form.noteGeologue}
                >
                    Enregistrer feedback
                </Button>
            </Stack>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Hist</TableCell>
                        <TableCell>Substance</TableCell>
                        <TableCell>Sys</TableCell>
                        <TableCell>Géo</TableCell>
                        <TableCell>Accord</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {feedback.map((f) => (
                        <TableRow key={f.id}>
                            <TableCell>{f.historique_id}</TableCell>
                            <TableCell>{f.substance}</TableCell>
                            <TableCell>{f.note_systeme}</TableCell>
                            <TableCell>{f.note_geologue}</TableCell>
                            <TableCell>{f.accord ? 'oui' : 'non'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
