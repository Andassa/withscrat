import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function RecipeReviewCard(props) {
  const { utilisateur, setUtilisateur } = props;
  const { modifier, setModifier } = props;
  const handleModif = ()=>{
    setModifier(true);
  }

  return (
    <Card sx={{ maxWidth: 800, alignItems: 'center', padding: '30px' }}>
      <ArrowBackIcon />
      <CardHeader
        avatar={
          <Avatar alt={utilisateur?.nom + ' ' + utilisateur?.prenom} src='assets/images/user.png' style={{ height: '125px', width: '125px', marginLeft: '130px' }} />
        }
        action={
          <Button onClick={handleModif} >Modifier</Button>
        }
      />
      <CardContent>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          '& .MuiTextField-root': { m: 2, width: '50ch' },
        }} style={{ alignItems: 'center' }}>
          <TextField
            id="standard-read-only-input"
            label="Nom"
            value={'Randriamanalina'}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <TextField
            id="standard-read-only-input"
            label="Prénom"
            value={utilisateur.prenom}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <TextField
            id="standard-read-only-input"
            label="Nom d'utilisateur"
            value={utilisateur.username}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <TextField
            id="standard-read-only-input"
            label="Fonction"
            value={utilisateur.fonction}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <TextField
            id="standard-read-only-input"
            label="Email"
            value={utilisateur.email}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
        </Box>
      </CardContent>
    </Card>
  );
}