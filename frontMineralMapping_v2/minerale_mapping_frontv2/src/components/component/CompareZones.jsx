import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import axiosInstance from '../../Lesmomdules/axiosInstance';

/**
 * Compare deux payloads JSON de type donneesTableau.
 */
export default function CompareZones() {
    const [jsonA, setJsonA] = useState('');
    const [jsonB, setJsonB] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const run = async () => {
        setError('');
        setResult(null);
        setLoading(true);
        try {
            const zoneA = JSON.parse(jsonA);
            const zoneB = JSON.parse(jsonB);
            const res = await axiosInstance.post('/api/decision/comparer', { zoneA, zoneB });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.erreur || err.message || 'Erreur comparaison');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom style={{ color: 'rgb(43, 102, 147)' }}>
                Comparaison de zones A / B
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Collez deux JSON `donneesTableau` (nomPersonne, selectPermis, listeCarre, choixSubs).
            </Typography>
            <TextField
                label="Zone A (JSON)"
                multiline
                minRows={6}
                fullWidth
                value={jsonA}
                onChange={(e) => setJsonA(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Zone B (JSON)"
                multiline
                minRows={6}
                fullWidth
                value={jsonB}
                onChange={(e) => setJsonB(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={run} disabled={loading}>
                {loading ? 'Comparaison…' : 'Comparer'}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {result && (
                <>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Substances: {result.verdict?.substancesComparees} · conflits A: {result.verdict?.conflitsA} · B: {result.verdict?.conflitsB}
                    </Alert>
                    <Table size="small" sx={{ mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Substance</TableCell>
                                <TableCell>Note A</TableCell>
                                <TableCell>Note B</TableCell>
                                <TableCell>Δ</TableCell>
                                <TableCell>Meilleur</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(result.deltas || []).map((d) => (
                                <TableRow key={d.subs}>
                                    <TableCell>{d.subs}</TableCell>
                                    <TableCell>{d.noteA ?? '—'}</TableCell>
                                    <TableCell>{d.noteB ?? '—'}</TableCell>
                                    <TableCell>{d.deltaNote ?? '—'}</TableCell>
                                    <TableCell>{d.meilleur}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </Paper>
    );
}
