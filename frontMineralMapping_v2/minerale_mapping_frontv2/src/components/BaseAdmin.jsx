import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import Slide from '@mui/material/Slide';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Container from '@mui/material/Container';
import logo from '../assets/images/bcmm.png';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import axiosInstance from '../Lesmomdules/axiosInstance';
import Button from '@mui/material/Button';

import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';

import TableauDeBord from './component/TableauDeBord';
import Carte from './Carte';
import Historique from './component/Historique';
import UtilisateurGestion from './component/UtilisateurGestion';

import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const pages = [''];
const settings = ['Profil', 'Logout'];

function ResponsiveDrawer(props) {
  const { fenetre } = props;
  const [fenetre2 ,setFenetre2] = useState('');
  const [taille] = useState(0);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [pejy, setPejy] = useState((<Carte />));
  const comp = [
    { name: 'Tableau de bord', page: 'Tableaudebord', icon: (<TableChartIcon />), comp: (<TableauDeBord />), lien: '/admin/dashboard' },
    { name: 'Carte', page: 'Carte', icon: (<MapIcon />), comp: (<Carte taille={taille} />), lien: '/admin/carte' },
    { name: 'Gestion Utilisateur', page: 'UtilisateurGestion', icon: (<PersonIcon />), comp: (<UtilisateurGestion />), lien: '/admin/utilisateurGestion' },
    { name: 'Historique', page: 'Historique', icon: (<HistoryIcon />), comp: (<Historique />), lien: '/admin/historique' },
  ]


  const [utilisateur, setUtilisateur] = useState(null);
  useEffect(() => {
    // Fonction pour effectuer la requête GET
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:3000/getSession');
        if (response.data.hasOwnProperty('user')) {
          setUtilisateur(response.data.user);
        }
        else {
          window.location.href = '/login';
        }

      } catch (error) {
        console.error('Erreur lors de la requête GET :', error);
      }
    };
    fetchData();
  }, []);

  const [composant, setComposant] = useState();
  useEffect(() => {
    setFenetre2(fenetre);
    console.log(fenetre2)
    const cmps = (comp.filter(element => element.page === fenetre)[0]).comp;
    setComposant(cmps);
  }, [fenetre, fenetre2]);
  const handleMenu = (lien) => {
    window.location.href = lien;
  }


  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {comp.map((text, index) => (
          <ListItem key={index} disablePadding onClick={() => handleMenu(text.lien)} active>
            <ListItemButton>
              <ListItemIcon>
                {text.icon}
              </ListItemIcon>
              <ListItemText primary={text.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  function HideOnScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
      target: window ? window() : undefined,
    });

    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
  }
  HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
  };
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setPejy((<Carte />));
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleSetting = (setting) => {
    localStorage.removeItem("userToken")
    window.location.href = "/login"
    console.log(setting);
  }

  // Remove this const when copying and pasting into your project.
  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <HideOnScroll {...props} >
        <AppBar style={{ backgroundColor: 'rgb(16 87 157)' }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <img src={logo} alt="logo d l entreprise" style={{ width: '95px', height: '45px', marginLeft: '20px' }} />
              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                >
                  {pages.map((page) => (
                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">{page}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Button
                    key={page}
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page}
                  </Button>
                ))}
              </Box>

              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Profil">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={utilisateur?.nom + ' ' + utilisateur?.prenom} src='assets/images/user.png' />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '50px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <div style={{ padding: '5px' }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                      <Avatar alt={utilisateur?.nom + ' ' + utilisateur?.prenom} src='assets/images/user.png' />
                    </div>
                    <p style={{ fontFamily: 'Merriweather' }} >{utilisateur?.nom + ' ' + utilisateur?.prenom}</p>
                  </div>
                  <hr />
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={() => handleSetting(setting)}>
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {/* <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer> */}
        </Box>
        {composant}
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
