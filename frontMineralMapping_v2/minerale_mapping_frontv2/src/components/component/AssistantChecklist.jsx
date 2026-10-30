import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axiosInstance from '../../Lesmomdules/axiosInstance';

export default function AssistantChecklist({ donneesTableau, localChecks }) {
    const [remote, setRemote] = useState(null);

    useEffect(() => {
        if (!donneesTableau) return;
        const t = setTimeout(() => {
            axiosInstance.post('/api/decision/checklist', { donneesTableau })
                .then((res) => setRemote(res.data))
                .catch(() => setRemote(null));
        }, 400);
        return () => clearTimeout(t);
    }, [donneesTableau]);

    const checks = remote?.checks || localChecks || [];

    return (
        <Paper sx={{ p: 2, mt: 2 }} variant="outlined">
            <Typography variant="h6" gutterBottom>
                Assistant de demande
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Checklist avant évaluation — les points rouges bloquent l&apos;envoi.
            </Typography>
            <List dense>
                {checks.map((c) => (
                    <ListItem key={c.id}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {c.ok
                                ? <CheckCircleIcon color="success" fontSize="small" />
                                : <CancelIcon color="error" fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={c.message} />
                    </ListItem>
                ))}
                {!checks.length && (
                    <ListItem>
                        <ListItemText primary="Remplissez les champs pour voir la checklist…" />
                    </ListItem>
                )}
            </List>
            {remote && (
                <Typography variant="body2" color={remote.ok ? 'success.main' : 'error.main'}>
                    {remote.ok ? 'Prêt pour évaluation' : 'Corrigez les points bloquants'}
                </Typography>
            )}
        </Paper>
    );
}
