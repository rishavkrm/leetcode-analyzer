import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth } from '../firebase-config';
import { Button } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import RegisterLogin from '../functions/register';
function AuthComponent() {
  const [, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsError] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await RegisterLogin(idToken)
      setMessage(`User signed in: ${result.user.displayName}`);
      setTimeout(() => {
        setMessage('');
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage(`Error signing in with Google: ${error}`);
      setIsError(true);
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      leftSection={<IconBrandGoogle size={16} />}
      // variant="subtle"
      color="#F26430"
      radius="xl"
      style={{
        transition: 'all 0.2s ease',
      }}
      onClick={handleGoogleSignIn}
      loading={isLoading}
      fullWidth
    >
      Sign in with Google
    </Button>
  );
}
export default AuthComponent;