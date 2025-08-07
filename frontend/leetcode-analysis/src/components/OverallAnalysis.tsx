/* eslint-disable @typescript-eslint/no-explicit-any */
import { Group, Title, Button, Loader, SimpleGrid, Card, Alert, Text, Container, ThemeIcon, List, Box, Paper, Timeline, useMantineTheme, Tooltip, ActionIcon } from "@mantine/core";
import { IconTrendingUp, IconTrendingDown, IconBulb, IconInfoCircle, IconBook, IconRefresh, IconArrowRight, IconRocket, IconAward, IconChartPie, IconTarget, IconCheck } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import { fetchOverAllAnalysis } from "../functions/helpers";
import type { OverallAnalysis } from "../types/types";

const OverallAnalysisComponent = ({ cookie, showNotification }: { cookie: string, showNotification: any }) => {
    const [overallAnalysis, setOverallAnalysis] = useState<OverallAnalysis | null>(null);
    const [loadingOverallAnalysis, setLoadingOverallAnalysis] = useState(false);
    const theme = useMantineTheme();

    const getOverallAnalysis = useCallback(async () => {
        setLoadingOverallAnalysis(true);
        try {
            const data = await fetchOverAllAnalysis(cookie);
            setOverallAnalysis(data.data);
            showNotification('Success', 'Your programming analysis is ready!', 'blue');
        } catch (error) {
            console.error('Error fetching overall analysis:', error);
            showNotification('Analysis Error', 'Failed to load your overall DSA analysis.', 'red');
        } finally {
            setLoadingOverallAnalysis(false);
        }
    }, [cookie, showNotification]);

    useEffect(() => {
        getOverallAnalysis();
    }, [getOverallAnalysis]);

    if (loadingOverallAnalysis) {
        return (
            <Paper radius="md" p="xl" withBorder shadow="md" style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Loader size="lg" variant="dots" />
                <Text mt="md" c="dimmed" size="sm">Analyzing your coding patterns, strengths, and areas for improvement...</Text>
                <Text c="dimmed" size="xs" mt="xs">This may take a moment as we process your submission history</Text>
            </Paper>
        );
    }

    if (!overallAnalysis) {
        return (
            <Paper radius="md" p="xl" withBorder shadow="md">
                <Alert icon={<IconInfoCircle size="1.5rem" />} title="Analysis Not Available" color="blue" variant="filled">
                    <Text>We need more of your submissions to create a comprehensive analysis.</Text>
                    <Button
                        variant="white"
                        color="blue"
                        onClick={getOverallAnalysis}
                        mt="md"
                        leftSection={<IconRefresh size={16} />}
                    >
                        Refresh Analysis
                    </Button>
                </Alert>
            </Paper>
        );
    }
    return (
        <Container fluid p={0}>
            <Paper radius="md" p="md" withBorder shadow="md" mb="lg">
                <Group justify="space-between" mb="xs">
                    <Title order={4} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconChartPie size={24} color={theme.colors.blue[6]} />
                        Your Coding Profile
                    </Title>
                    <Tooltip label="Refresh your analysis">
                        <ActionIcon
                            color="blue"
                            variant="light"
                            onClick={getOverallAnalysis}
                            loading={loadingOverallAnalysis}
                        >
                            <IconRefresh size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                <Text c="dimmed" size="sm" mb="lg">
                    Based on your LeetCode submission history, we've analyzed your coding patterns and performance.
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                    {/* Strengths Card */}
                    <Card withBorder radius="md" padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Card.Section withBorder inheritPadding py="xs" bg="rgba(54, 179, 126, 0.1)">
                            <Group justify="space-between">
                                <Text fw={700} size="lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconTrendingUp style={{ color: theme.colors.teal[6] }} size={20} />
                                    Your Strengths
                                </Text>
                                <ThemeIcon color="teal" variant="light" radius="xl" size="md">
                                    <IconAward size={16} />
                                </ThemeIcon>
                            </Group>
                        </Card.Section>

                        <Box mt="md" style={{ flexGrow: 1 }}>
                            <List spacing="sm" size="sm" center icon={
                                <ThemeIcon color="teal" size={18} radius="xl">
                                    <IconCheck size={12} />
                                </ThemeIcon>
                            }>
                                {overallAnalysis.strengths.map((strength, index) => (
                                    <List.Item key={index}>
                                        <Text size="sm">{strength}</Text>
                                    </List.Item>
                                ))}
                            </List>
                        </Box>
                    </Card>

                    {/* Weaknesses Card */}
                    <Card withBorder radius="md" padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Card.Section withBorder inheritPadding py="xs" bg="rgba(255, 107, 107, 0.1)">
                            <Group justify="space-between">
                                <Text fw={700} size="lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconTrendingDown style={{ color: theme.colors.pink[6] }} size={20} />
                                    Areas to Improve
                                </Text>
                                <ThemeIcon color="pink" variant="light" radius="xl" size="md">
                                    <IconTarget size={16} />
                                </ThemeIcon>
                            </Group>
                        </Card.Section>

                        <Box mt="md" style={{ flexGrow: 1 }}>
                            <List spacing="sm" size="sm" center icon={
                                <ThemeIcon color="pink" size={18} radius="xl">
                                    <IconArrowRight size={12} />
                                </ThemeIcon>
                            }>
                                {overallAnalysis.weaknesses.map((weakness, index) => (
                                    <List.Item key={index}>
                                        <Text size="sm">{weakness}</Text>
                                    </List.Item>
                                ))}
                            </List>
                        </Box>
                    </Card>

                    {/* Learning Plan Card */}
                    <Card withBorder radius="md" padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Card.Section withBorder inheritPadding py="xs" bg="rgba(96, 120, 234, 0.1)">
                            <Group justify="space-between">
                                <Text fw={700} size="lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconRocket style={{ color: theme.colors.indigo[6] }} size={20} />
                                    Learning Plan
                                </Text>
                                <ThemeIcon color="indigo" variant="light" radius="xl" size="md">
                                    <IconBulb size={16} />
                                </ThemeIcon>
                            </Group>
                        </Card.Section>

                        <Box mt="md" style={{ flexGrow: 1 }}>
                            <Timeline active={overallAnalysis.learningRecommendations.length - 1} bulletSize={24} lineWidth={2}>
                                {overallAnalysis.learningRecommendations.map((recommendation, index) => (
                                    <Timeline.Item
                                        key={index}
                                        bullet={<IconBook size={12} />}
                                        title={`Focus Area ${index + 1}`}
                                    >
                                        <Text size="sm" mb="xs">{recommendation}</Text>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </Box>

                        <Button
                            component="a"
                            href="/learning"
                            variant="light"
                            color="indigo"
                            fullWidth
                            rightSection={<IconArrowRight size={16} />}
                            mt="auto"
                        >
                            Explore Learning Resources
                        </Button>
                    </Card>
                </SimpleGrid>

                {overallAnalysis.commonMistakesSummary && (
                    <Paper withBorder p="md" radius="md" mt="lg" style={{
                        background: 'linear-gradient(to right, rgba(255, 190, 77, 0.1), rgba(251, 211, 141, 0.05))'
                    }}>
                        <Group mb="xs">
                            <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
                                <IconInfoCircle size={20} />
                            </ThemeIcon>
                            <Text fw={700} size="md">Common Pitfalls to Watch For</Text>
                        </Group>
                        <Text size="sm">{overallAnalysis.commonMistakesSummary}</Text>
                    </Paper>
                )}
            </Paper>
        </Container>
    );
};

export default OverallAnalysisComponent;