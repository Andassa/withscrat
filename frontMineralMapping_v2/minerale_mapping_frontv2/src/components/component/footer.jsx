import React from 'react';
import { Typography, AppBar, Toolbar, Container } from '@mui/material';

const Footer = () => {
  return (
    <AppBar position="static" style={{ backgroundColor: 'white', color: 'blue' }}>
      <Toolbar>
        <Container maxWidth="md">
          <Typography variant="body1" color="inherit">
            © {new Date().getFullYear()} MineralMapping BCMM
          </Typography>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
