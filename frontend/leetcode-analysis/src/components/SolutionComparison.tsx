/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { Modal, Paper, Title, Text, Group, Tabs, Accordion, Badge, Skeleton, Center, Loader } from '@mantine/core';
import { IconZoomCode, IconFocus, IconListCheck, IconGitCompare } from '@tabler/icons-react';
import type { Submission } from '../types/types';
import { fetchComparisonData } from '../functions/helpers';
import { Prism } from '@mantine/prism';
import type { ComparisonData } from '../types/types';
interface SolutionComparisonProps {
  opened: boolean;
  onClose: () => void;
  submission: Submission | null;
}

function SolutionComparison({ opened, onClose, submission }: SolutionComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const loadComparisonData = async () => {
      if (!submission) return;
      setIsLoading(true);
      try {
        const data = await fetchComparisonData(submission);
        setComparisonData(data.data);
      } catch (error) {
        console.error("Failed to load comparison data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (opened) {
      loadComparisonData();
    }
  }, [opened, submission]);

  if (!submission) return null;

  // Loading component for code blocks
  const CodeSkeleton = () => (
    <>
      <Skeleton height={20} width="80%" mb="md" />
      <Skeleton height={15} width="90%" mb="xs" />
      <Skeleton height={15} width="85%" mb="xs" />
      <Skeleton height={15} width="88%" mb="xs" />
      <Skeleton height={15} width="70%" mb="xs" />
      <Skeleton height={15} width="75%" mb="xs" />
    </>
  );

  return (
    <Modal
      opened={opened}
      onClose={() => { setComparisonData(null); onClose() }}
      title={<Title order={4}>Solution Comparison: {submission?.title}</Title>}
      size="100%"
    >
      <Tabs defaultValue="compare">
        <Tabs.List>
          <Tabs.Tab value="compare" leftSection={<IconGitCompare size={16} />}>
            Side-by-Side
          </Tabs.Tab>
          <Tabs.Tab value="diff" leftSection={<IconZoomCode size={16} />}>
            Diff View
          </Tabs.Tab>
          <Tabs.Tab value="insights" leftSection={<IconFocus size={16} />}>
            Key Insights
          </Tabs.Tab>
          <Tabs.Tab value="steps" leftSection={<IconListCheck size={16} />}>
            Improvement Steps
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="compare" pt="md">
          <Group grow align="flex-start">
            <Paper withBorder p="md">
              <Group mb="xs">
                <Title order={5}>Your Solution</Title>
                <Badge color={submission.isBestSolution ? "green" : "yellow"}>
                  {submission.isBestSolution ? "Optimal" : "Can Improve"}
                </Badge>
              </Group>

              <Text size="sm" mb="xs">
                Time: {submission.currentTimeComplexity} | Space: {submission.currentSpaceComplexity}
              </Text>

              {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error */}
              <Prism colorScheme="dark" language={getLanguageForPrism(submission.lang)} withLineNumbers>
                {submission.code}
              </Prism>
            </Paper>

            <Paper withBorder p="md">
              <Title order={5} mb="xs">Optimal Solution</Title>
              <Text size="sm" mb="xs">
                Time: {submission.bestTimeComplexity} | Space: {submission.bestSpaceComplexity}
              </Text>

              {isLoading ? (
                <CodeSkeleton />
              ) : (
                // @ts-expect-error
                <Prism colorScheme="dark" language={getLanguageForPrism(submission.lang)} withLineNumbers>
                  {comparisonData?.optimalCode || "No optimal solution available"}
                </Prism>
              )}
            </Paper>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="diff" pt="md">
          <Text mb="md">Changes needed to optimize your solution:</Text>
          {isLoading ? (
            <CodeSkeleton />
          ) : (
            // @ts-expect-error
            <Prism colorScheme="dark" language={getLanguageForPrism(submission.lang)} withLineNumbers>
              {comparisonData?.diffView || "No diff information available"}
            </Prism>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          {isLoading ? (
            <>
              <Skeleton height={25} width="50%" mb="lg" />
              <Skeleton height={15} width="100%" mb="sm" />
              <Skeleton height={15} width="95%" mb="sm" />
              <Skeleton height={15} width="90%" mb="xl" />

              <Skeleton height={25} width="60%" mb="lg" />
              <Skeleton height={15} width="97%" mb="sm" />
              <Skeleton height={15} width="94%" mb="sm" />
            </>
          ) : (
            <Accordion>
              <Accordion.Item value="algorithmic">
                <Accordion.Control>
                  <Text fw={500}>Algorithmic Insights</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>{comparisonData?.insights?.algorithmic || "No algorithmic insights available"}</Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="complexity">
                <Accordion.Control>
                  <Text fw={500}>Complexity Analysis</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>{comparisonData?.insights?.complexity || "No complexity analysis available"}</Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="patterns">
                <Accordion.Control>
                  <Text fw={500}>Pattern Recognition</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>{comparisonData?.insights?.patterns || "No pattern insights available"}</Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="steps" pt="md">
          <Text mb="md">Follow these steps to improve your solution:</Text>
          {isLoading ? (
            <>
              <Skeleton height={80} width="100%" mb="md" />
              <Skeleton height={100} width="100%" mb="md" />
              <Skeleton height={90} width="100%" mb="md" />
            </>
          ) : comparisonData?.steps && comparisonData.steps.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            comparisonData.steps.map((step: any, index: number) => (
              <Paper key={index} withBorder p="md" mb="md">
                <Group mb="xs">
                  <Badge>{index + 1}</Badge>
                  <Text fw={500}>{step.title}</Text>
                </Group>
                <Text size="sm" mb="sm">{step.description}</Text>
                {step.code && (
                  // @ts-expect-error
                  <Prism colorScheme="dark" language={getLanguageForPrism(submission.lang)}>
                    {step.code}
                  </Prism>
                )}
              </Paper>
            ))
          ) : (
            <Text c="dimmed">No improvement steps available</Text>
          )}
        </Tabs.Panel>
      </Tabs>

      {isLoading && (
        <Center my="xl">
          <Loader size="md" />
        </Center>
      )}
    </Modal>
  );
}

// Helper functions
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



export default SolutionComparison;