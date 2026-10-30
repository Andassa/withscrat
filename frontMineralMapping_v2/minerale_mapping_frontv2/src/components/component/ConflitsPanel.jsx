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
import axiosInstance from '../../Lesmomdules/axiosInstance';

export default function ConflitsPanel({ listeCarre, conflits: conflitsProp }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(conflitsProp || null);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (conflitsProp) setData(conflitsProp);
    }, [conflitsProp]);

    const scan = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/decision/conflits', { listeCarre });
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.erreur || 'Erreur détection conflits');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Conflits de titres {data?.alerte ? `(${data.count})` : ''}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Chevauchements avec la couche cadastre active ({data?.layer || 'PERMIS_LAYER'}).
                </Typography>
                <Button variant="outlined" size="small" onClick={scan} disabled={loading || !listeCarre?.length}>
                    {loading ? 'Analyse…' : 'Scanner les conflits'}
                </Button>
                {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
                {data && (
                    <Alert severity={data.alerte ? 'warning' : 'success'} sx={{ mt: 1 }}>
                        {data.message}
                    </Alert>
                )}
                {data?.conflits?.length > 0 && (
                    <List dense>
                        {data.conflits.slice(0, 12).map((c) => (
                            <ListItem key={c.gid}>
                                <ListItemText
                                    primary={`#${c.gid} ${c.titres_no_ || c.titre || ''} ${c.type_tit_1 || c.type || ''}`}
                                    secondary={`titulaire: ${c.registre_1 || c.r_nom || '—'} · overlap ${c.overlap_m2 || '?'} m²`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </AccordionDetails>
        </Accordion>
    );
}
