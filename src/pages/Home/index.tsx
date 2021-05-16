import { getSidebarMenu, getUserProfile, logout } from './service';
import AppMenu from '../../components/AppMenu';
import AppAvatar from '../../components/AppAvatar';
import Dropdown from '../../components/Dropdown';
import { useTexts } from '../../utils/texts';
import { ConnectState } from '../../models';
import { AppState } from '../../models/app';
import { Dispatch, SidebarMenuItem, User } from '../../interfaces';
import AppUserCard from '../../components/AppUserCard';
import { encodeRedirectPathname } from '../../utils/redirect';
import Fallback from '../../components/Fallback';
import { useRequest } from '../../utils/request';
import React, { useState, Suspense, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { Divider, MenuItem } from '@material-ui/core';
import { Route, Redirect, Switch } from 'react-router-dom';
import { useHistory } from 'react-router';
import './index.less';

// /home/exams
const HomeExamsPage = React.lazy(() => import('./Exams'));
// /home/questions
const HomeQuestionsPage = React.lazy(() => import('./Questions'));
// /home/papers
const HomePapersPage = React.lazy(() => import('./Papers'));
// /home/exams/review_list/:id
const HomeExamsReviewListPage = React.lazy(() => import('./Exams/ReviewList'));
// /home/exams/invigilate/:id
const HomeExamInvigilatePage = React.lazy(() => import('./Exams/Invigilate'));
// /home/exams/invigilate/recording/:id
const HomeExamInvigilateRecordingPage = React.lazy(() => import('./Exams/Invigilate/Recording'));
// /home/account
const HomeAccountPage = React.lazy(() => import('./Account'));
// /home/admin
const HomeAdminPage = React.lazy(() => import('./Admin'));

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
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: 0,
  },
}));

export interface HomePageProps extends AppState, Dispatch {
  window?: () => Window;
}

const HomePage: React.FC<HomePageProps> = ({
  dispatch,
  ...props
}) => {
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const dropdownTexts = useTexts(dispatch, 'avatarDropdown');
  const sidebarMenuTexts = useTexts(dispatch, 'sidebarMenu');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userProfile, userProfileLoading] = useRequest<User>(getUserProfile);
  const [sidebarMenu, sidebarMenuLoading] = useRequest<SidebarMenuItem[]>(getSidebarMenu, [sidebarMenuTexts]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container = window !== undefined
    ? () => window().document.body
    : undefined;

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
            classes={{
              paper: 'app-page-home__avatar-dropdown',
              list: 'list',
            }}
            trigger={<AppAvatar user={userProfile} loading={userProfileLoading} />}
            closeOnClickBody={true}
          >
            <AppUserCard user={userProfile} />
            <Divider />
            <MenuItem
              onClick={() => {
                history.push('/home/account/profile');
              }}
            >{dropdownTexts['001']}</MenuItem>
            <MenuItem
              onClick={() => {
                history.push('/home/account/change_email');
              }}
            >{dropdownTexts['002']}</MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                history.push('/home/exams?role=resource%2Fexam%2Fparticipant');
              }}
            >{dropdownTexts['003']}</MenuItem>
            <MenuItem
              onClick={() => {
                history.push('/home/papers');
              }}
            >{dropdownTexts['004']}</MenuItem>
            <MenuItem
              onClick={() => {
                history.push('/home/questions');
              }}
            >{dropdownTexts['005']}</MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                const redirect = encodeRedirectPathname(history.location);
                logout(redirect).then((res) => {
                  if (res) {
                    history.push(res || '/user/auth');
                  }
                });
              }}
            >{dropdownTexts['006']}</MenuItem>
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
            <AppMenu items={sidebarMenu} loading={sidebarMenuLoading} />
          </Drawer>
        </Hidden>
        <Hidden xsDown={true} implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open={true}
          >
            <AppMenu items={sidebarMenu} loading={sidebarMenuLoading} />
          </Drawer>
        </Hidden>
      </nav>
      <main className={clsx(classes.content, 'app-container')}>
        <Suspense fallback={<Fallback />}>
          <Switch>
            <Route path="/home/exams" component={HomeExamsPage} exact={true} />
            <Route path="/home/questions" component={HomeQuestionsPage} />
            <Route path="/home/papers" component={HomePapersPage} />
            <Route path="/home/account" component={HomeAccountPage} />
            <Route path="/home/admin" component={HomeAdminPage} />
            <Route path="/home/exams/review_list/:id" component={HomeExamsReviewListPage} />
            <Route path="/home/exams/invigilate/recording/:id" component={HomeExamInvigilateRecordingPage} />
            <Route path="/home/exams/invigilate/:id" component={HomeExamInvigilatePage} />
            <Redirect from="/home" to="/home/exams" exact={true} />
          </Switch>
        </Suspense>
      </main>
    </div>
  );
};

export default connect(({ app }: ConnectState) => app)(HomePage);
