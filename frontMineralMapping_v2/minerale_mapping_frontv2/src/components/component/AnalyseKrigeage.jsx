import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import axiosInstance from '../../Lesmomdules/axiosInstance';

/**
 * Analyse spatiale complémentaire — hors score principal du permis.
 */
export default function AnalyseKrigeage({ choixSubs }) {
    const [lon, setLon] = useState('');
    const [lat, setLat] = useState('');
    const [substance, setSubstance] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const run = async () => {
        setError('');
        setResult(null);
        const sub = substance || (Array.isArray(choixSubs) && choixSubs[0]) || '';
        if (!sub || lon === '' || lat === '') {
            setError('Substance, longitude et latitude requis');
            return;
        }
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/analyse/krigeage', {
                substance: typeof sub === 'object' ? (sub.libelle || sub.nom || sub.name) : String(sub),
                newx: Number(lon),
                newy: Number(lat),
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.erreur || err.response?.data?.detail || 'Erreur krigeage');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Analyse krigeage (hors score permis)</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Estimation locale en un point — n&apos;entre pas dans la note d&apos;évaluation du permis.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 360 }}>
                    <TextField
                        size="small"
                        label="Substance"
                        value={substance}
                        onChange={(e) => setSubstance(e.target.value)}
                        placeholder="ex: Nickel"
                    />
                    <TextField
                        size="small"
                        label="Longitude (X)"
                        type="number"
                        value={lon}
                        onChange={(e) => setLon(e.target.value)}
                    />
                    <TextField
                        size="small"
                        label="Latitude (Y)"
                        type="number"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                    />
                    <Button variant="outlined" onClick={run} disabled={loading}>
                        {loading ? 'Calcul…' : 'Lancer le krigeage'}
                    </Button>
                    {error && <Alert severity="error">{error}</Alert>}
                    {result && (
                        <Alert severity="info">
                            {result.message
                                ? result.message
                                : `Prédit: ${result.predicted ?? '—'} · Variance: ${result.variance ?? '—'}`}
                        </Alert>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}
