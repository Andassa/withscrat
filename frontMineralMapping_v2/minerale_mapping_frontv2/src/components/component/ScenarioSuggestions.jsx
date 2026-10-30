import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import axiosInstance from '../../Lesmomdules/axiosInstance';

export default function ScenarioSuggestions({ donneesTableau, onScenarioResult }) {
    const [suggestions, setSuggestions] = useState([]);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const loadSuggestions = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await axiosInstance.post('/api/decision/suggestions', {
                listeCarre: donneesTableau?.listeCarre,
            });
            setSuggestions(res.data.suggestions || []);
            setMsg(res.data.message || `${(res.data.suggestions || []).length} suggestion(s)`);
        } catch (err) {
            setMsg(err.response?.data?.erreur || 'Erreur suggestions');
        } finally {
            setLoading(false);
        }
    };

    const runScenario = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await axiosInstance.post('/api/decision/scenario', { donneesTableau });
            onScenarioResult?.(res.data);
            setMsg('Scénario calculé (non enregistré dans l\'historique)');
        } catch (err) {
            setMsg(err.response?.data?.error || err.response?.data?.erreur || 'Erreur scénario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Suggestions & scénario « et si… »</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button size="small" variant="outlined" onClick={loadSuggestions} disabled={loading || !donneesTableau?.listeCarre?.length}>
                        Suggérer substances
                    </Button>
                    <Button size="small" variant="contained" onClick={runScenario} disabled={loading || !donneesTableau}>
                        Recalculer sans sauver
                    </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {suggestions.map((s) => (
                        <Chip key={s.nom} label={s.nom} size="small" title={s.reason} sx={{ mb: 0.5 }} />
                    ))}
                </Stack>
                {msg && <Alert severity="info" sx={{ mt: 1 }}>{msg}</Alert>}
            </AccordionDetails>
        </Accordion>
    );
}
