import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';

import logo from '../assets/images/bcmm.png';
import axiosInstance from '../Lesmomdules/axiosInstance';
import { bcmm } from '../theme/bcmm';

import TableauDeBord from './component/TableauDeBord';
import Carte from './Carte';
import Historique from './component/Historique';
import UtilisateurGestion from './component/UtilisateurGestion';
import CompareZones from './component/CompareZones';
import DossierInstruction from './component/DossierInstruction';
import ValidationMetier from './component/ValidationMetier';

const drawerWidth = 248;

function ResponsiveDrawer(props) {
  const { fenetre } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [utilisateur, setUtilisateur] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const comp = [
    { name: 'Tableau de bord', page: 'Tableaudebord', icon: <TableChartIcon fontSize="small" />, lien: '/admin/dashboard' },
    { name: 'Carte', page: 'Carte', icon: <MapIcon fontSize="small" />, lien: '/admin/carte' },
    { name: 'Utilisateurs', page: 'UtilisateurGestion', icon: <PersonIcon fontSize="small" />, lien: '/admin/utilisateurGestion' },
    { name: 'Historique', page: 'Historique', icon: <HistoryIcon fontSize="small" />, lien: '/admin/historique' },
    { name: 'Comparer zones', page: 'Comparer', icon: <CompareArrowsIcon fontSize="small" />, lien: '/admin/comparer' },
    { name: 'Instruction', page: 'Instruction', icon: <AssignmentIcon fontSize="small" />, lien: '/admin/instruction' },
    { name: 'Validation métier', page: 'Validation', icon: <ScienceIcon fontSize="small" />, lien: '/admin/validation' },
  ];

  const views = {
    Tableaudebord: <TableauDeBord />,
    Carte: <Carte taille={0} />,
    UtilisateurGestion: <UtilisateurGestion />,
    Historique: <Historique />,
    Comparer: <CompareZones />,
    Instruction: <DossierInstruction />,
    Validation: <ValidationMetier />,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/getSession');
        if (Object.prototype.hasOwnProperty.call(response.data, 'user')) {
          setUtilisateur(response.data.user);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Erreur session:', error);
      }
    };
    fetchData();
  }, []);

  const handleMenu = (lien) => {
    window.location.href = lien;
  };

  const handleDrawerToggle = () => setMobileOpen((v) => !v);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: bcmm.surface.sidebar }}>
      <Toolbar
        sx={{
          px: 2,
          minHeight: '64px !important',
          borderBottom: `1px solid ${bcmm.surface.border}`,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="BCMM"
          sx={{ height: 34, width: 'auto', display: 'block', maxWidth: '100%' }}
        />
      </Toolbar>
      <List sx={{ px: 1.25, py: 1.5, flex: 1 }}>
        {comp.map((item) => {
          const active = item.page === fenetre;
          return (
            <ListItem key={item.page} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenu(item.lien)}
                selected={active}
                sx={{
                  borderRadius: `${bcmm.radius.sm}px`,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: bcmm.surface.sidebarActive,
                    color: bcmm.brand.primary,
                    '& .MuiListItemIcon-root': { color: bcmm.brand.primary },
                    '&:hover': { bgcolor: bcmm.surface.sidebarActive },
                  },
                  '&:hover': { bgcolor: 'rgba(27, 79, 138, 0.06)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? bcmm.brand.primary : bcmm.ink.muted }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    fontWeight: active ? 700 : 500,
                    color: active ? bcmm.brand.primary : bcmm.ink.body,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: 11, color: bcmm.ink.muted }}>
          BCMM, comptes internes
        </Typography>
      </Box>
    </Box>
  );

  const container = props.window !== undefined ? () => props.window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: bcmm.surface.canvas }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: bcmm.surface.card,
          color: bcmm.ink.title,
          borderBottom: `1px solid ${bcmm.surface.border}`,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ flexGrow: 1, fontSize: 15, fontWeight: 600, color: bcmm.ink.body }}>
            {comp.find((c) => c.page === fenetre)?.name || 'Administration'}
          </Typography>
          <Tooltip title="Profil">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
              <Avatar
                alt={`${utilisateur?.nom || ''} ${utilisateur?.prenom || ''}`}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: bcmm.brand.primary,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {(utilisateur?.nom || 'A').charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1.5, minWidth: 180 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: bcmm.ink.title }}>
                {utilisateur ? `${utilisateur.nom || ''} ${utilisateur.prenom || ''}`.trim() : 'Utilisateur'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: bcmm.ink.muted }}>
                {utilisateur?.username || 'session'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Typography sx={{ fontSize: 14 }}>Déconnexion</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${bcmm.surface.border}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${bcmm.surface.border}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: fenetre === 'Carte' ? 0 : { xs: 2, md: 2.5 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: fenetre === 'Carte' ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', flexShrink: 0 }} />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            overflow: fenetre === 'Carte' ? 'hidden' : 'auto',
          }}
        >
          {views[fenetre] || <TableauDeBord />}
        </Box>
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  fenetre: PropTypes.string,
  window: PropTypes.func,
};

export default ResponsiveDrawer;
