import React, { useEffect, useState } from 'react';
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
import axiosInstance from '../../Lesmomdules/axiosInstance';

export default function ValidationMetier() {
    const [report, setReport] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [form, setForm] = useState({
        historiqueId: '',
        substance: '',
        noteSysteme: '',
        noteGeologue: '',
        commentaire: '',
    });
    const [msg, setMsg] = useState('');

    const loadFeedback = async () => {
        const res = await axiosInstance.get('/api/validation/feedback');
        setFeedback(res.data.feedback || []);
        setStats(res.data.stats || null);
    };

    useEffect(() => {
        loadFeedback().catch(() => {});
    }, []);

    const runFixtures = async () => {
        const res = await axiosInstance.get('/api/validation/fixtures');
        setReport(res.data);
    };

    const save = async () => {
        await axiosInstance.post('/api/validation/feedback', {
            historiqueId: form.historiqueId,
            substance: form.substance,
            noteSysteme: Number(form.noteSysteme),
            noteGeologue: Number(form.noteGeologue),
            commentaire: form.commentaire,
        });
        setMsg('Feedback géologue enregistré');
        await loadFeedback();
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Validation métier ScoreEngine
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fixtures automatiques + retours géologue (accord note système / note experte).
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
            <Stack spacing={1} sx={{ maxWidth: 480, mb: 2 }}>
                <TextField size="small" label="ID historique" value={form.historiqueId} onChange={(e) => setForm({ ...form, historiqueId: e.target.value })} />
                <TextField size="small" label="Substance" value={form.substance} onChange={(e) => setForm({ ...form, substance: e.target.value })} />
                <TextField size="small" type="number" label="Note système (1-4)" value={form.noteSysteme} onChange={(e) => setForm({ ...form, noteSysteme: e.target.value })} />
                <TextField size="small" type="number" label="Note géologue (1-4)" value={form.noteGeologue} onChange={(e) => setForm({ ...form, noteGeologue: e.target.value })} />
                <TextField size="small" label="Commentaire" value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} />
                <Button variant="outlined" onClick={save}>Enregistrer feedback</Button>
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
