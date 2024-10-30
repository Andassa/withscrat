import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Container from '@mui/material/Container';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import logo from '../assets/images/bcmm.png';
import axiosInstance from '../Lesmomdules/axiosInstance';

import Carte from './Carte';
import Profil from './component/Profil';
import Profil2 from './component/Profil2';
import Modifier from './component/Modifier';

const pages = ['Carte'];
// const pages = ['Ajout de donnée'];
const settings = ['Profil', 'Déconnexion'];


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


export default function HideAppBar(props) {
    const [pejy, setPejy] = useState((<Carte />));
    const [modifier, setModifier] = useState(null);

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
    const [utilisateur, setUtilisateur] = useState(null);
    // const profileComponent = (<Box style={{maxWidth: 500, alignItems: 'center'}} ><Profil utilisateur ={utilisateur} setUtilisateur={setUtilisateur} /></Box>);
    const profileComponent = (<div style={{ marginLeft: '650px', marginTop: '50px' }} ><Profil utilisateur={utilisateur} setUtilisateur={setUtilisateur} modifier={modifier} setModifier={setModifier} /></div>);
    const handleSetting = (setting) => {
        console.log(setting);
        if (setting==='Profil') {
            setPejy(profileComponent);
        }else{
            localStorage.removeItem("userToken")
            window.location.href = '/login';
        }
    }
    useEffect(() => {
        if (utilisateur !== null) {
            if (modifier === true) {
                setPejy((<div style={{ marginLeft: '650px', marginTop: '50px' }} ><Modifier utilisateur={utilisateur} setUtilisateur={setUtilisateur} modifier={modifier} setModifier={setModifier} /></div>));
            }
            if(modifier === false) {
                setPejy(profileComponent);
            }
        }
    }, [modifier, utilisateur])


    return (
        <React.Fragment>
            <CssBaseline />
            <HideOnScroll {...props} >
                <AppBar style={{ backgroundColor: 'rgb(16 87 157)' }}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters>
                            <img src={logo} alt="logo d l entreprise" style={{ width: '95px', height: '45px', marginRight: '20px' }} />
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
                                    sx={{ mt: '45px' }}
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
            <Toolbar />
            <Container sx={{ mx: 0, ml: 0 }} style={{ marginTop: '15px' }}>
                <Box sx={{ my: 1 }}>
                    {pejy}
                </Box>
            </Container>
        </React.Fragment>
    );
}
