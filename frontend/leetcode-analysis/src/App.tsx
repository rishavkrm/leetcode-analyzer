import { useCallback, useState } from 'react';
import { MantineProvider, AppShell, Title, Button, Group, Box, Anchor, Text, Burger, Drawer, Stack } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconLogout, IconCode, IconBulb, IconHome, IconListCheck } from '@tabler/icons-react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { CookieProvider, useCookie } from './contexts/CookieContext';

// Import components
import SubmissionsDashboard from './components/SubmissionDashboard';
import CookieInput from './components/CookieInput';
import LearningHub from './components/LearningHub';
import ProtectedRoute from './components/ProtectedRoute';
import AuthComponent from './components/LoginRegister'; // Assuming this handles login
import RevisionList from './components/RevisionList.tsx';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth as firebaseAuth } from './firebase-config'; // Import Firebase auth instance
import { signOut } from 'firebase/auth'; // For logout functionality
import LandingPage from './components/LandingPage.tsx';

const myMantineTheme = {
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  components: {
    Button: { styles: { root: { borderRadius: 'var(--mantine-radius-md)' } } },
    Paper: { styles: { root: { borderRadius: 'var(--mantine-radius-md)' } } },
    Modal: { styles: { content: { borderRadius: 'var(--mantine-radius-md)' }, header: { borderTopLeftRadius: 'var(--mantine-radius-md)', borderTopRightRadius: 'var(--mantine-radius-md)' } } },
    Accordion: { styles: { item: { borderRadius: 'var(--mantine-radius-md)', marginBottom: 'var(--mantine-spacing-sm)' }, control: { borderRadius: 'var(--mantine-radius-md)' } } },
    Alert: { styles: { root: { borderRadius: 'var(--mantine-radius-sm)' } } }
  }
};

function Navigation() {
  const location = useLocation();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const { innerWidth } = window;
  const isMobile = innerWidth < 768;

  const navItemStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    width: isMobile ? '100%' : 'auto',
  });

  const navItems = [
    { path: '/', label: 'Home', icon: <IconHome size={18} /> },
    { path: '/leetcode-submissions', label: 'Submissions', icon: <IconCode size={18} /> },
    { path: '/learning', label: 'Learning Hub', icon: <IconBulb size={18} /> },
    { path: '/revision-list', label: 'Revise', icon: <IconListCheck size={18} /> },
  ];

  const renderNavLinks = () => (
    navItems.map(item => (
      <Anchor
        key={item.path}
        component={Link}
        to={item.path}
        underline="never"
        fw={600}
        c={location.pathname === item.path ? 'blue.4' : 'gray.4'}
        style={navItemStyle(location.pathname === item.path)}
      >
        <Group gap="xs">
          {item.icon}
          <Text>{item.label}</Text>
        </Group>
      </Anchor>
    ))
  );

  // Mobile drawer navigation
  if (isMobile) {
    return (
      <>
        <Burger
          opened={drawerOpened}
          onClick={() => setDrawerOpened(!drawerOpened)}
          color="white"
          size="sm"
        />
        <Drawer
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          title="Navigation"
          padding="md"
          zIndex={1000}
          size="xs"
          withCloseButton
        >
          <Stack>
            {renderNavLinks()}
          </Stack>
        </Drawer>
      </>
    );
  }

  // Desktop navigation
  return (
    <Group gap="sm">
      {renderNavLinks()}
    </Group>
  );
}


// App component (the main application structure)
function AppContent() {
  const { leetCodeCookie, storeLeetCodeCookie } = useCookie();
  const { showNotification } = useNotifications();
  const { isAuthenticated } = useAuth(); // Use auth context for login state
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
      storeLeetCodeCookie(null);
      showNotification('Logged Out', 'You have been signed out.', 'blue');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Error', 'Failed to log out.', 'red');
    }
  }, [storeLeetCodeCookie, showNotification, navigate]);

  const handleCookieSet = useCallback((cookie: string) => {
    storeLeetCodeCookie(cookie);
    showNotification('Success', 'LeetCode cookie stored.', 'green');
    // navigate('/');
  }, [storeLeetCodeCookie, showNotification]);

  return (
    <AppShell
      // padding="md"
      header={{ height: 70 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
    >
      <AppShell.Header withBorder={false} style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: 'rgb(51, 50, 50)',
      }}>
        <Group h="100%" px="xl" justify="space-between" align="center">
          <Group gap="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
                <circle cx='50' cy='50' r='48' fill='#333' />
                <path d='M25 20 L25 80 L75 80 L75 70 L35 70 L35 20 Z' fill='#4CAF50' />
                <rect x='45' y='40' width='10' height='20' fill='#FFD700' />
                <rect x='60' y='30' width='10' height='30' fill='#FFD700' />
              </svg>
            </Box>
            <Title order={3} style={{
              fontWeight: 700,
              letterSpacing: '-0.5px',
              background: 'rgb(216, 227, 244)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '24px',
              display: window.innerWidth > 500 ? 'block' : 'none'
            }}>
              LeetCode Analyzer
            </Title>
          </Group>

          {/* Center navigation for desktop */}
          <Box style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
            <Navigation />
          </Box>

          {/* Mobile navigation and auth buttons */}
          <Group>
            {window.innerWidth <= 768 && <Navigation />}
            {isAuthenticated ? (
              <Button
                leftSection={<IconLogout size={16} />}
                variant="subtle"
                color="white"
                radius="xl"
                onClick={handleLogout}
                style={{
                  transition: 'all 0.2s ease',
                  backgroundColor: ' #6761A8',
                  '&:hover': {
                    backgroundColor: 'rgba(19, 15, 246, 0.12)'
                  }
                }}
              >
                {window.innerWidth > 500 ? 'Sign Out' : ''}
              </Button>
            ) : (
              <AuthComponent />
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main >
        <Routes>
          <Route path="/" element={
            <LandingPage />
          } />
          <Route path="/leetcode-submissions" element={
            <ProtectedRoute>
              {!leetCodeCookie ? (
                <CookieInput onCookieSet={handleCookieSet} />
              ) : (
                <SubmissionsDashboard cookie={leetCodeCookie} onCookieClear={handleLogout} />
              )}
            </ProtectedRoute>
          } />
          <Route path="/revision-list" element={
            <ProtectedRoute>
              <RevisionList />
            </ProtectedRoute>
          } />
          <Route path="/learning" element={
            <ProtectedRoute>
              <LearningHub />
            </ProtectedRoute>
          } />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

function App() {
  return (
    <MantineProvider theme={myMantineTheme}>
      <BrowserRouter basename="/">
        <NotificationProvider>
          <AuthProvider>
            <CookieProvider>
              <AppContent /> {/* The main app content lives here */}
            </CookieProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;