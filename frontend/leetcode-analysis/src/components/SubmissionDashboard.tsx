import {
    Container, Loader, Alert, Button, Table, Badge, Group, Tooltip,
    ActionIcon, Paper, ScrollArea, Text, TextInput, Tabs,
    Modal, NumberInput, Select, Textarea, Menu,
    Divider, Card, Box
} from "@mantine/core";
import {
    IconInfoCircle, IconCode, IconAnalyze, IconExternalLink, IconSearch,
    IconRefresh, IconGitCompare, IconChartBar, IconTable,
    IconDotsVertical, IconAlertCircle, IconFilter, IconX, IconCheck,
    IconClock, IconStackPush
} from "@tabler/icons-react";
import { useState, useCallback } from "react";
import AnalysisModal from "./AnalysisModal";
import CodeModal from "./CodeModal";
import type { AnalysisReport, Submission } from "../types/types";
import { fetchSubmissions, fetchFeedback } from "./../functions/helpers"
import SolutionComparison from './SolutionComparison';
import OverallAnalysisComponent from "./OverallAnalysis";
import { useNotifications } from "../contexts/NotificationContext";
import { addRevisionProblem } from '../functions/revisionHelpers';
import type { RevisionProblem } from '../types/types';

interface SubmissionsDashboardProps {
    cookie: string;
    onCookieClear: () => void;
}

const defaultRevisionFormData = {
    confidence_level: 3,
    difficulty: 'Medium',
    tags: [],
    notes: '',
    last_revised: new Date().toISOString(),
    next_revision: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Set next revision to one week later
    revision_count: 0,
    id: 0,
    lang: '',
    lang_name: '',
    timestamp: 0,
    status_display: '',
    runtime: '',
    url: '',
    isPending: '',
    title: '',
    memory: '',
    code: '',
    isBestSolution: false,
    currentTimeComplexity: '',
    currentSpaceComplexity: '',
    bestTimeComplexity: '',
    bestSpaceComplexity: ''
}

function SubmissionsDashboard({ cookie, onCookieClear }: SubmissionsDashboardProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false); // Changed to false initially
    const [errorSubmissions, setErrorSubmissions] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'best' | 'non-best' | 'passed' | 'failed'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedSubmissionForCode, setSelectedSubmissionForCode] = useState<Submission | null>(null);
    const [selectedSubmissionForAnalysis, setSelectedSubmissionForAnalysis] = useState<Submission | null>(null);
    const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [codeModalOpened, setCodeModalOpened] = useState(false);
    const [analysisModalOpened, setAnalysisModalOpened] = useState(false);
    const [solutionComparisonOpened, setSolutionComparisonOpened] = useState(false);
    const [selectedSubmissionForComparison, setSelectedSubmissionForComparison] = useState<Submission | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>("submissions");
    const [addRevisionModalOpened, setAddRevisionModalOpened] = useState(false);
    const [revisionForm, setRevisionForm] = useState<RevisionProblem>(defaultRevisionFormData);
    const [submissionsLimit, setSubmissionsLimit] = useState<number>(20);
    const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false); // New state to track if we've fetched data
    const { showNotification } = useNotifications();

    const openSolutionComparison = () => setSolutionComparisonOpened(true);
    const closeSolutionComparison = () => setSolutionComparisonOpened(false);
    const handleCompare = (submission: Submission) => {
        setSelectedSubmissionForComparison(submission);
        openSolutionComparison();
    };
    const openCodeModal = () => setCodeModalOpened(true);
    const closeCodeModal = () => setCodeModalOpened(false);
    const openAnalysisModal = () => setAnalysisModalOpened(true);
    const closeAnalysisModal = () => setAnalysisModalOpened(false);

    const filteredSubmissions = submissions.filter(submission => {
        const categoryMatches =
            filter === 'all' ? true :
                filter === 'best' ? submission.isBestSolution :
                    filter === 'non-best' ? !submission.isBestSolution :
                        filter === 'passed' ? submission.status_display === 'Accepted' :
                            filter === 'failed' ? submission.status_display !== 'Accepted' :
                                true;

        const searchMatches =
            !searchQuery.trim() ? true :
                submission.title.toLowerCase().includes(searchQuery.toLowerCase());

        return categoryMatches && searchMatches;
    });

    const loadSubmissions = useCallback(async () => {
        setLoadingSubmissions(true);
        setRefreshing(true);
        setErrorSubmissions(null);
        try {
            const data = await fetchSubmissions(cookie, submissionsLimit);
            data.data.sort((a: Submission, b: Submission) => b.timestamp - a.timestamp);
            setSubmissions(data.data);
            setHasInitiallyFetched(true);
            if (data.data.length === 0) {
                showNotification('Info', 'No submissions found for your account.', 'blue');
            } else {
                showNotification('Success', `Loaded ${data.data.length} submissions successfully.`, 'green');
            }
        } catch (err) {
            console.log(err)
            const errorMessage = 'An unknown error occurred while fetching submissions.';
            setErrorSubmissions(errorMessage);
            showNotification('Error Fetching Submissions', errorMessage, 'red');
            if (errorMessage.includes('Invalid or expired LeetCode cookie') || errorMessage.includes('401') || errorMessage.includes('403')) {
                onCookieClear();
            }
        } finally {
            setLoadingSubmissions(false);
            setRefreshing(false);
        }
    }, [cookie, onCookieClear, showNotification, submissionsLimit]);

    const handleViewCode = (submission: Submission) => {
        setSelectedSubmissionForCode(submission);
        openCodeModal();
    };

    const handleFeedback = async (submission: Submission) => {
        setSelectedSubmissionForAnalysis(submission);
        setAnalysisReport(null);
        setLoadingAnalysis(true);
        openAnalysisModal();
        try {
            const report = await fetchFeedback({
                id: submission.id,
                code: submission.code,
                lang: submission.lang,
                title: submission.title
            });
            setAnalysisReport(report?.data);
        } catch (err) {
            console.log(err)
            const errorMessage = 'Could not fetch analysis for this submission.';
            showNotification('Analysis Failed', errorMessage, 'red');
            closeAnalysisModal();
            if (errorMessage.includes('Invalid or expired LeetCode cookie') || errorMessage.includes('401') || errorMessage.includes('403')) {
                onCookieClear();
            }
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleAddToRevision = (submission: Submission) => {
        console.log("Probelm added for submission - 1", submission)
        setSelectedSubmissionForCode(submission);
        setRevisionForm({
            ...submission,
            notes: '',
            confidence_level: 3,
            difficulty: "NA",
            tags: [],
            revision_count: 0,
            last_revised: new Date().toISOString(),
            next_revision: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        setAddRevisionModalOpened(true);
    };

    const handleSaveRevision = async () => {
        try {
            console.log("Revision form data - 2 , ", revisionForm)
            await addRevisionProblem([revisionForm]);
            showNotification('Success', 'Problem added to revisions', 'green');
            setAddRevisionModalOpened(false);
            setRevisionForm(defaultRevisionFormData);
        } catch (err) {
            showNotification('Error', 'Failed to add problem to revisions: ' + err, 'red');
        }
    };

    if (!hasInitiallyFetched && !loadingSubmissions) {
        return (
            <Container size="sm" py="xl">
                <Paper p="xl" radius="md" withBorder shadow="md">
                    <Text size="xl" fw={600} mb="lg">
                        Fetch Your LeetCode Submissions
                    </Text>

                    <Text size="sm" c="dimmed" mb="md">
                        Please specify how many of your most recent submissions you'd like to fetch from LeetCode.
                        More submissions will provide better analytics but may take longer to load.
                    </Text>

                    <NumberInput
                        label="Number of submissions to fetch"
                        description="Choose between 10 and 100 submissions"
                        value={submissionsLimit}
                        onChange={(value) => setSubmissionsLimit(Number(value) || 20)}
                        min={10}
                        max={100}
                        step={10}
                        size="md"
                        mb="xl"
                    />

                    <Group justify="center">
                        <Button
                            size="md"
                            leftSection={<IconRefresh size={16} stroke={1.5} />}
                            onClick={loadSubmissions}
                            style={{
                                backgroundImage: 'linear-gradient(45deg, #228be6, #4dabf7)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Fetch Submissions
                        </Button>
                    </Group>
                </Paper>
            </Container>
        );
    }

    if (loadingSubmissions) {
        return (
            <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: "30px", alignContent: "center" }}>
                <Loader size="xl" variant="dots" />
                <Text mt="md" fw={500} size="lg" c="dimmed">Loading your LeetCode submissions...</Text>
                <Text size="sm" c="dimmed" mt="xs">This may take a moment as we process your data</Text>
            </Container>
        );
    }

    if (errorSubmissions && submissions.length === 0) {
        return (
            <Container size="md" py="xl">
                <Paper p="xl" radius="md" withBorder shadow="md">
                    <Alert
                        icon={<IconAlertCircle size="1.5rem" />}
                        title="There was a problem loading your submissions"
                        color="red"
                        radius="md"
                        variant="filled"
                    >
                        <Text mb="md">{errorSubmissions}</Text>
                        <Button
                            variant="white"
                            color="red"
                            leftSection={<IconRefresh size={16} />}
                            onClick={loadSubmissions}
                        >
                            Retry Loading Submissions
                        </Button>
                    </Alert>
                </Paper>
            </Container>
        );
    }
    const rows = filteredSubmissions.map((submission) => (
        <Table.Tr
            key={submission.timestamp}
            style={{
                backgroundColor: !submission.isBestSolution && submission.status_display === 'Accepted'
                    ? 'rgba(253, 240, 221, 0.2)'
                    : undefined,
                transition: 'background-color 0.2s ease',
            }}
        >
            <Table.Td>
                <Group>
                    <Text fw={600} truncate="end" style={{ maxWidth: 250 }} title={submission.title}>
                        {submission.title}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Group gap="xs" wrap="nowrap">
                    <Badge
                        color={submission.status_display === 'Accepted' ? 'teal' : 'red'}
                        variant="filled"
                        radius="sm"
                        style={{ minWidth: '80px', textAlign: 'center' }}
                    >
                        {submission.status_display}
                    </Badge>
                    {submission.status_display === 'Accepted' && (
                        <Badge
                            size="xs"
                            variant="dot"
                            color={submission.isBestSolution ? 'green' : 'yellow'}
                            title={submission.isBestSolution ? "Optimal Solution" : "Can be improved"}
                        >
                        </Badge>
                    )}
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="blue" radius="sm">
                    {submission.lang_name}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Group gap="xs" wrap="nowrap">
                    <IconClock size={16} stroke={1.5} />
                    <Text size="sm">{new Date(submission.timestamp * 1000).toLocaleDateString()}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Tooltip label={`Current: ${submission.currentSpaceComplexity} | Best: ${submission.bestSpaceComplexity}`} withArrow position="top">
                    <Group gap="xs" wrap="nowrap">
                        <Text size="sm" fw={500}>{submission.currentSpaceComplexity}</Text>
                        {submission.currentSpaceComplexity !== submission.bestSpaceComplexity && (
                            <Badge size="xs" color="yellow" variant="light">
                                → {submission.bestSpaceComplexity}
                            </Badge>
                        )}
                    </Group>
                </Tooltip>
            </Table.Td>
            <Table.Td>
                <Tooltip label={`Current: ${submission.currentTimeComplexity} | Best: ${submission.bestTimeComplexity}`} withArrow position="top">
                    <Group gap="xs" wrap="nowrap">
                        <Text size="sm" fw={500}>{submission.currentTimeComplexity}</Text>
                        {submission.currentTimeComplexity !== submission.bestTimeComplexity && (
                            <Badge size="xs" color="yellow" variant="light">
                                → {submission.bestTimeComplexity}
                            </Badge>
                        )}
                    </Group>
                </Tooltip>
            </Table.Td>
            <Table.Td style={{ textAlign: 'center' }}>
                <Group align="center" gap="xs">
                    <Tooltip label="Compare" withArrow position="top">
                        <ActionIcon color="blue" variant="light" size="sm" radius="md" onClick={() => handleCompare(submission)}>
                            <IconGitCompare size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Feedback" withArrow position="top">
                        <ActionIcon color="indigo" variant="light" size="sm" radius="md" onClick={() => handleFeedback(submission)}>
                            <IconAnalyze size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Add to Revision List" withArrow position="top">
                        <ActionIcon color="teal" variant="light" size="sm" radius="md" onClick={() => handleAddToRevision(submission)}>
                            <IconStackPush size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Menu width={200} position="bottom-end" shadow="md">
                        <Menu.Target>
                            <ActionIcon variant="subtle" size="sm" radius="md">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconCode size={16} stroke={1.5} />}
                                onClick={() => handleViewCode(submission)}
                            >
                                View Code
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconAnalyze size={16} stroke={1.5} />}
                                onClick={() => handleFeedback(submission)}
                                color="blue"
                            >
                                Get feedback
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconGitCompare size={16} stroke={1.5} />}
                                onClick={() => handleCompare(submission)}
                                color="violet"
                            >
                                Compare Solution
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<IconExternalLink size={16} stroke={1.5} />}
                                component="a"
                                href={`https://leetcode.com${submission.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open on LeetCode
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconStackPush size={16} stroke={1.5} />}
                                onClick={() => handleAddToRevision(submission)}
                                color="teal"
                            >
                                Add to Revision List
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container fluid style={{ display: 'flex', flexDirection: 'column', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            <Tabs value={activeTab} onChange={setActiveTab} mb="md">
                <Tabs.List>
                    <Tabs.Tab
                        value="submissions"
                        leftSection={<IconTable size={16} stroke={1.5} />}
                        style={{ fontWeight: 500 }}
                    >
                        Submissions
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="analysis"
                        leftSection={<IconChartBar size={16} stroke={1.5} />}
                        style={{ fontWeight: 500 }}
                    >
                        Overall Analysis
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="submissions" pt="md">
                    {submissions.length === 0 && !loadingSubmissions && !errorSubmissions && (
                        <Paper p="xl" radius="md" withBorder>
                            <Group justify="center" style={{ textAlign: 'center' }}>
                                <div>
                                    <IconInfoCircle size={48} stroke={1.5} color="#228be6" style={{ opacity: 0.8 }} />
                                    <Text size="xl" fw={500} mt="md">No submissions found</Text>
                                    <Text c="dimmed" size="sm" mt="xs" mb="lg" maw={400} mx="auto">
                                        Try solving some problems on LeetCode to see your submissions here!
                                    </Text>
                                    <Button
                                        component="a"
                                        href="https://leetcode.com/problemset/"
                                        target="_blank"
                                        variant="light"
                                    >
                                        Go to LeetCode Problems
                                    </Button>
                                </div>
                            </Group>
                        </Paper>
                    )}

                    {errorSubmissions && submissions.length > 0 && (
                        <Alert icon={<IconInfoCircle size="1rem" />} title="Error refreshing data" color="orange" variant="light" mb="md">
                            <Text size="sm">There was an issue refreshing submissions: {errorSubmissions}</Text>
                            <Text size="sm">Displaying cached or older data.</Text>
                        </Alert>
                    )}

                    {submissions.length > 0 && (
                        <>
                            <Box mb="lg">
                                <Card shadow="sm" p="md" radius="md" withBorder>
                                    <Group justify="space-between" mb="md">
                                        <Group>
                                            <Text fw={500}>Submissions</Text>
                                            <Badge size="sm" variant="light">
                                                {filteredSubmissions.length} of {submissions.length}
                                            </Badge>
                                        </Group>

                                        <Group>
                                            <Text>
                                                Number of submissions:
                                            </Text>
                                            <NumberInput
                                                value={submissionsLimit}
                                                placeholder="Number of submissions"
                                                onChange={(value) => setSubmissionsLimit(Number(value) || 20)}
                                                min={20}
                                                max={100}
                                                step={20}
                                                size="xs" />

                                            <Button
                                                size="xs"
                                                variant="light"
                                                leftSection={<IconRefresh size={14} stroke={1.5} />}
                                                onClick={() => loadSubmissions()}
                                                loading={refreshing}
                                                radius="md"
                                            >
                                                {refreshing ? 'Refreshing...' : 'Refresh'}
                                            </Button>

                                            <TextInput
                                                placeholder="Search by problem title"
                                                leftSection={<IconSearch size={16} stroke={1.5} />}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                                size="xs"
                                                style={{ width: '250px' }}
                                                rightSection={
                                                    searchQuery ? (
                                                        <ActionIcon size="xs" onClick={() => setSearchQuery('')} radius="xl">
                                                            <IconX size={14} stroke={1.5} />
                                                        </ActionIcon>
                                                    ) : null
                                                }
                                            />
                                        </Group>
                                    </Group>

                                    <Divider mb="md" label={
                                        <Group gap={6}>
                                            <IconFilter size={14} stroke={1.5} />
                                            <Text size="sm">Filters</Text>
                                        </Group>
                                    } />

                                    <Group grow mb="xs">
                                        <Button
                                            size="xs"
                                            variant={filter === 'all' ? 'filled' : 'light'}
                                            onClick={() => setFilter('all')}
                                            radius="md"
                                            style={{ transition: 'all 0.2s ease' }}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant={filter === 'passed' ? 'filled' : 'light'}
                                            color="teal"
                                            onClick={() => setFilter('passed')}
                                            radius="md"
                                            style={{ transition: 'all 0.2s ease' }}
                                            leftSection={<IconCheck size={14} stroke={1.5} />}
                                        >
                                            Passed
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant={filter === 'failed' ? 'filled' : 'light'}
                                            color="red"
                                            onClick={() => setFilter('failed')}
                                            radius="md"
                                            style={{ transition: 'all 0.2s ease' }}
                                            leftSection={<IconX size={14} stroke={1.5} />}
                                        >
                                            Failed
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant={filter === 'best' ? 'filled' : 'light'}
                                            color="green"
                                            onClick={() => setFilter('best')}
                                            radius="md"
                                            style={{ transition: 'all 0.2s ease' }}
                                            leftSection={<IconCheck size={14} stroke={1.5} />}
                                        >
                                            Optimal
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant={filter === 'non-best' ? 'filled' : 'light'}
                                            color="yellow"
                                            onClick={() => setFilter('non-best')}
                                            radius="md"
                                            style={{ transition: 'all 0.2s ease' }}
                                            leftSection={<IconAlertCircle size={14} stroke={1.5} />}
                                        >
                                            Need Improvement
                                        </Button>
                                    </Group>

                                    {filteredSubmissions.length === 0 && (
                                        <Alert icon={<IconInfoCircle size="1rem" />} color="blue" variant="light" mt="md">
                                            <Text size="sm">No submissions match your current filters. Try adjusting your search or filters.</Text>
                                        </Alert>
                                    )}
                                </Card>
                            </Box>

                            <Paper withBorder shadow="md" radius="md" style={{ overflow: 'hidden' }}>
                                <ScrollArea>
                                    <Table
                                        striped
                                        highlightOnHover
                                        withTableBorder
                                        withColumnBorders
                                        verticalSpacing="sm"
                                        horizontalSpacing="md"
                                        stickyHeader
                                        stickyHeaderOffset={0}
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th style={{ fontWeight: 600 }}>Problem</Table.Th>
                                                <Table.Th style={{ fontWeight: 600 }}>Status</Table.Th>
                                                <Table.Th style={{ fontWeight: 600 }}>Lang</Table.Th>
                                                <Table.Th style={{ fontWeight: 600 }}>Date</Table.Th>
                                                <Table.Th style={{ fontWeight: 600 }}>Space Complexity</Table.Th>
                                                <Table.Th style={{ fontWeight: 600 }}>Time Complexity</Table.Th>
                                                <Table.Th style={{ textAlign: 'center', fontWeight: 600 }}>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>{rows}</Table.Tbody>
                                    </Table>
                                </ScrollArea>
                            </Paper>
                        </>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="analysis" pt="md">
                    <OverallAnalysisComponent cookie={cookie} showNotification={showNotification} />
                </Tabs.Panel>
            </Tabs>

            <CodeModal opened={codeModalOpened} onClose={closeCodeModal} submission={selectedSubmissionForCode} />
            <AnalysisModal
                opened={analysisModalOpened}
                onClose={closeAnalysisModal}
                analysisReport={analysisReport}
                isLoading={loadingAnalysis}
                submissionTitle={selectedSubmissionForAnalysis?.title}
            />
            <SolutionComparison
                opened={solutionComparisonOpened}
                onClose={closeSolutionComparison}
                submission={selectedSubmissionForComparison}
            />
            <Modal
                opened={addRevisionModalOpened}
                onClose={() => setAddRevisionModalOpened(false)}
                title={
                    <Text fw={600} size="lg">
                        Add to Revision List: {revisionForm.title}
                    </Text>
                }
                size="lg"
                radius="md"
                centered
            >
                <Paper p="md" withBorder radius="md" mb="md" style={{ backgroundColor: '#f9f9fa' }}>
                    <Group mb="xs">
                        <Badge color={revisionForm.status_display === 'Accepted' ? 'teal' : 'red'} variant="filled" radius="sm">
                            {revisionForm.status_display}
                        </Badge>
                        <Badge variant="outline" color="blue" radius="sm">
                            {revisionForm.lang_name}
                        </Badge>
                        {revisionForm.isBestSolution && (
                            <Badge color="green" variant="light" radius="sm">
                                Optimal Solution
                            </Badge>
                        )}
                    </Group>
                    <Text size="sm">
                        <Text span fw={500}>Time Complexity:</Text> {revisionForm.currentTimeComplexity}
                    </Text>
                    <Text size="sm">
                        <Text span fw={500}>Space Complexity:</Text> {revisionForm.currentSpaceComplexity}
                    </Text>
                </Paper>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <Select
                        label="Problem Difficulty"
                        description="Select the difficulty level of this problem"
                        value={revisionForm.difficulty}
                        onChange={(value) => setRevisionForm({ ...revisionForm, difficulty: value || 'Medium' })}
                        data={[
                            { value: 'Easy', label: 'Easy' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'Hard', label: 'Hard' }
                        ]}
                    />

                    <NumberInput
                        label="Your Confidence Level"
                        description="Rate how confident you feel about this problem (1-5)"
                        value={revisionForm.confidence_level}
                        onChange={(value) => setRevisionForm({ ...revisionForm, confidence_level: Number(value) || 3 })}
                        min={1}
                        max={5}
                        size="sm"
                    />

                    <Textarea
                        label="Notes for Future Review"
                        description="Add your thoughts, approaches or things to remember"
                        placeholder="E.g., Used two-pointer approach. Remember to consider edge cases with empty arrays."
                        value={revisionForm.notes}
                        onChange={(e) => setRevisionForm({ ...revisionForm, notes: e.target.value })}
                        autosize
                        minRows={3}
                        maxRows={6}
                    />

                    <TextInput
                        label="Tags"
                        description="Categorize this problem (comma separated)"
                        placeholder="E.g., binary-search, arrays, two-pointers"
                        value={revisionForm.tags?.join(', ')}
                        onChange={(e) => setRevisionForm({
                            ...revisionForm,
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        })}
                    />

                    <Divider my="sm" />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={() => setAddRevisionModalOpened(false)}
                            color="gray"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveRevision}
                            style={{
                                backgroundImage: 'linear-gradient(45deg, #20c997, #0ca678)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Add to Revision List
                        </Button>
                    </Group>
                </div>
            </Modal>
        </Container>
    );
}

export default SubmissionsDashboard;