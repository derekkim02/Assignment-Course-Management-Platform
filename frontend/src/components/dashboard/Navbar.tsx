import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import unswNavbarLogo from '../../assets/unswNavbarLogo.png';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static" style={{ backgroundColor: '#231f20' }}>
        <Toolbar style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', height: '60px' }}>
            <img src={unswNavbarLogo} alt="UNSW Logo" style={{ height: '50px', width: 'auto', marginRight: '16px', paddingBottom: '10px', paddingTop: '10px' }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {children}
            <IconButton onClick={handleMenuOpen} style={{ marginLeft: '16px' }}>
              <Avatar alt="Profile Picture" src="/path/to/profile-picture.jpg" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
