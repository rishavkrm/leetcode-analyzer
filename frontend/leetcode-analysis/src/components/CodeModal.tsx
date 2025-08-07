import { Modal, ScrollArea, Paper } from "@mantine/core";
import { Prism } from '@mantine/prism';

// Code Modal Component

interface PrismInput {
  title: string;
  lang_name: string;
  code: string;
}
interface CodeModalProps {
  opened: boolean;
  onClose: () => void;
  submission: PrismInput | null;
}

function getLanguageForPrism(lang: string) {
  const mapping: Record<string, string> = {
    'python': 'python',
    'python3': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'java': 'java',
    'cpp': 'cpp',
    'c++': 'cpp',
    'c': 'c',
    'csharp': 'csharp',
    'go': 'go',
    'ruby': 'ruby',
    'swift': 'swift',
    'scala': 'scala',
    'rust': 'rust',
    'kotlin': 'kotlin',
  };
  return mapping[lang.toLowerCase()] || 'javascript';
}

function CodeModal({ opened, onClose, submission }: CodeModalProps) {
  if (!submission) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Code for: ${submission.title} (${submission.lang_name})`}
      size="100%"
      scrollAreaComponent={ScrollArea.Autosize}
      centered
    >
      <Paper p="md" withBorder style={{ maxHeight: '70vh', overflowY: 'auto', background: '#f9f9f9' }}>
        <Prism colorScheme="dark"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          language={getLanguageForPrism(submission?.lang_name.toLowerCase())}
          withLineNumbers
          copyLabel="Copy code"
          copiedLabel="Copied!"
        >
          {submission.code}
        </Prism>
      </Paper>
    </Modal>
  );
}

export default CodeModal;