import React, { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import AppMenu from '../../components/AppMenu';
import clsx from 'clsx';
import AppAvatar from '../../components/AppAvatar';
import Dropdown from '../../components/Dropdown';
import { useHistory } from 'react-router-dom';
import { useTexts } from '../../utils/texts';
import { connect } from 'react-redux';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch, User } from '../../interfaces';
import './index.less';
import { getUserProfile } from './service';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => createStyles({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: '100%',
      marginLeft: drawerWidth,
    },
    backgroundColor: 'white',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  // necessary for content to be below app bar
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export interface HomePageProps extends AppState, Dispatch {
  window?: () => Window;
}

const HomePage: React.FC<HomePageProps> = (props) => {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dropdownTexts = useTexts(props.dispatch, 'dropdown');
  const history = useHistory();
  const [userProfile, setUserProfile] = useState<User>(undefined);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container = window !== undefined
    ? () => window().document.body
    : undefined;

  useEffect(() => {
    getUserProfile().then((res) => {
      if (res) {
        setUserProfile(res);
      }
    });
  }, []);

  return (
    <div className="app-page app-page-home">
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx('app-page__navbar', classes.appBar)}
        elevation={0}
      >
        <Toolbar classes={{ root: 'app-page__navbar__toolbar' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <img
            src="/assets/images/logo_text.svg"
            alt="logo"
            className="app-page__navbar__toolbar__logo"
          />
        </Toolbar>
        <Toolbar>
          <Dropdown
            trigger={<AppAvatar user={{ email: 'lenconda@foxmail.com', name: '彭瀚林' }} />}
          >
            <div style={{ height: 200 }}></div>
          </Dropdown>
        </Toolbar>
      </AppBar>
      <nav className={clsx('app-sidebar', classes.drawer)} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp={true} implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <AppMenu />
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            <AppMenu />
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <Toolbar />
      </main>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(HomePage);
