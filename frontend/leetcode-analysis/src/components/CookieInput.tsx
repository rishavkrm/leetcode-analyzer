import { Container, Paper, Title, TextInput, Button, Text } from "@mantine/core";
import { IconCookie } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNotifications } from '../contexts/NotificationContext'; // New import


interface CookieInputProps {
  onCookieSet: (cookie: string) => void;
}

function CookieInput({ onCookieSet }: CookieInputProps) {
  const [cookie, setCookie] = useState('');
  const { showNotification } = useNotifications();
  const handleSubmit = () => {
    if (cookie.trim()) {
      onCookieSet(cookie.trim());
      try {
        localStorage.setItem('leetcode_cookie', cookie.trim());
      } catch (error) {
        console.error('Error saving cookie to local storage:', error);
        showNotification('Error', 'Failed to save cookie to local storage.', 'red');
      }
      localStorage.setItem('leetcode_cookie', cookie.trim());
      showNotification('Cookie Saved', 'LeetCode cookie has been saved locally.', 'green');
    } else {
      showNotification('Error', 'Cookie cannot be empty.', 'red');
    }
  };
  useEffect(() => {
    try {
      const storedCookie = localStorage.getItem('leetcode_cookie');
      if (storedCookie) {
        setCookie(storedCookie);
        onCookieSet(storedCookie);
        showNotification('Cookie Loaded', 'LeetCode cookie has been loaded from local storage.', 'green');
      }
    } catch (error) {
      console.error('Error loading cookie from local storage:', error);
      showNotification('Error', 'Failed to load cookie from local storage.', 'red');
    }
  }, [])

  // check cookie in local storage



  return (
    <Container size="xs" p="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100vh - 60px - 40px)' }}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2} ta="center" mb="lg">LeetCode Submission Analyzer</Title>
        <Text c="dimmed" ta="center" mb="xl">
          Please enter your LeetCode session cookie to fetch your submissions.
          This cookie will be stored only in your browser's local storage.
        </Text>
        <TextInput
          label="LeetCode Cookie"
          placeholder="Enter your LeetCode cookie here"
          value={cookie}
          onChange={(event) => setCookie(event.currentTarget.value)}
          required
          mb="md"
          leftSection={<IconCookie size={16} />}
        />
        <Button fullWidth onClick={handleSubmit} variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
          Save Cookie & Continue
        </Button>
        <Text size="xs" c="dimmed" ta="center" mt="lg">
          Tip: To get your LeetCode cookie: Sign in to LeetCode.  → Open Developer Tools. → Go to 'Network' tab. → Search for 'graphql'. → Find 'Cookie' in 'Request Headers'.
        </Text>
      </Paper>
    </Container>
  );
}

export default CookieInput