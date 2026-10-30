import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import axiosInstance from '../../Lesmomdules/axiosInstance';

export default function ConflitsPanel({ listeCarre, conflits: conflitsProp, onConflits }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(conflitsProp || null);
    const [error, setError] = useState('');
    const [layer, setLayer] = useState('permis_shp');
    const [threshold, setThreshold] = useState(100);

    React.useEffect(() => {
        if (conflitsProp) setData(conflitsProp);
    }, [conflitsProp]);

    const scan = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/decision/conflits', {
                listeCarre,
                layer,
                blockingOverlapM2: Number(threshold),
            });
            setData(res.data);
            onConflits?.(res.data);
        } catch (err) {
            setError(err.response?.data?.erreur || 'Erreur détection conflits');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Accordion sx={{ mt: 2 }} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                    Conflits de titres {data?.alerte ? `(${data.count}${data.bloquant ? ' · BLOQUANT' : ''})` : ''}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Couche</InputLabel>
                        <Select label="Couche" value={layer} onChange={(e) => setLayer(e.target.value)}>
                            <MenuItem value="permis_shp">permis_shp</MenuItem>
                            <MenuItem value="permis_625">permis_625</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        size="small"
                        type="number"
                        label="Seuil bloquant m²"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        sx={{ width: 150 }}
                    />
                    <Button variant="outlined" size="small" onClick={scan} disabled={loading || !listeCarre?.length}>
                        {loading ? 'Analyse…' : 'Scanner'}
                    </Button>
                </Stack>
                {error && <Alert severity="error">{error}</Alert>}
                {data && (
                    <Alert severity={data.bloquant ? 'error' : data.alerte ? 'warning' : 'success'} sx={{ mt: 1 }}>
                        {data.message}
                    </Alert>
                )}
                {data?.conflits?.length > 0 && (
                    <List dense>
                        {data.conflits.slice(0, 12).map((c) => (
                            <ListItem key={c.gid}>
                                <ListItemText
                                    primary={`#${c.gid} ${c.titres_no_ || c.titre || ''} [${c.severite}]`}
                                    secondary={`titulaire: ${c.registre_1 || c.r_nom || '—'} · ${c.overlap_m2} m²`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </AccordionDetails>
        </Accordion>
    );
}
