// src/components/RevisionList.tsx
import { useState, useEffect } from 'react';
import {
    Container, Loader, Button, Table, Badge, Group, Tooltip,
    ActionIcon, Paper, ScrollArea, Text, TextInput, Select,
    Modal, Textarea, NumberInput, Menu, Tabs, Card,
    Timeline,
    ThemeIcon, Center,
    Grid
} from "@mantine/core";
import {
    IconInfoCircle, IconCode, IconRefresh, IconSearch, IconTrash,
    IconEdit, IconCalendar, IconGitCompare, IconX,
    IconDotsVertical, IconStar, IconClockHour4, IconHistory,
    IconTags, IconAlertCircle, IconCheck, IconBookmark,
    IconFlag,
    IconChevronDown,
    IconNotes
} from "@tabler/icons-react";
import type { RevisionProblem } from '../types/types';
import {
    fetchRevisions, updateRevisionProblem,
    deleteRevisionProblem
} from '../functions/revisionHelpers';
import { useNotifications } from "../contexts/NotificationContext";
import CodeModal from "./CodeModal";
import SolutionComparison from './SolutionComparison';

export default function RevisionList() {
    const [revisions, setRevisions] = useState<RevisionProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'due' | 'overdue' | 'upcoming'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedRevision, setSelectedRevision] = useState<RevisionProblem | null>(null);
    const [codeModalOpened, setCodeModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [comparisonOpened, setComparisonOpened] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'table' | 'timeline'>('table');

    // Edit form state
    const [editForm, setEditForm] = useState<RevisionProblem | null>(null);

    const { showNotification } = useNotifications();

    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    // Toggle row expansion handler
    const toggleRowExpansion = (title: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // Load revisions
    const loadRevisions = async () => {
        setLoading(true);
        setRefreshing(true);
        setError(null);

        try {
            const data = await fetchRevisions();
            setRevisions(data.data || []);
            showNotification('Success', 'Revision problems loaded successfully', 'green');
        } catch (err) {
            console.error(err);
            const errorMessage = 'Failed to load revision problems';
            setError(errorMessage);
            showNotification('Error', errorMessage, 'red');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadRevisions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter revisions based on selected filter and search query
    const filteredRevisions = revisions.filter(revision => {
        const today = new Date().toISOString().split('T')[0];

        const filterMatches =
            filter === 'all' ? true :
                filter === 'due' ? revision.next_revision === today :
                    filter === 'overdue' ? revision.next_revision < today :
                        filter === 'upcoming' ? revision.next_revision > today :
                            true;

        const searchMatches =
            !searchQuery ? true :
                revision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                revision.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return filterMatches && searchMatches;
    });

    // Modal handlers
    const openCodeModal = () => setCodeModalOpened(true);
    const closeCodeModal = () => setCodeModalOpened(false);

    const openEditModal = (revision: RevisionProblem) => {
        setSelectedRevision(revision);
        setEditForm({ ...revision });
        setEditModalOpened(true);
    };

    const closeEditModal = () => {
        setEditModalOpened(false);
        setEditForm(null);
    };

    const openComparisonModal = (revision: RevisionProblem) => {
        setSelectedRevision(revision);
        setComparisonOpened(true);
    };

    const closeComparisonModal = () => setComparisonOpened(false);

    // View code
    const handleViewCode = (revision: RevisionProblem) => {
        setSelectedRevision(revision);
        openCodeModal();
    };

    // Mark as revised
    const handleMarkRevised = async (revision: RevisionProblem) => {
        try {
            // Calculate next revision date based on confidence level and spaced repetition
            const today = new Date();
            let nextRevisionDays = 1;

            if (revision.confidence_level === 1) {
                nextRevisionDays = 1; // Review tomorrow
            } else if (revision.confidence_level === 2) {
                nextRevisionDays = 3; // Review in 3 days
            } else if (revision.confidence_level === 3) {
                nextRevisionDays = 7; // Review in a week
            } else if (revision.confidence_level === 4) {
                nextRevisionDays = 14; // Review in 2 weeks
            } else {
                nextRevisionDays = 30; // Review in a month
            }

            const nextRevision = new Date(today);
            nextRevision.setDate(nextRevision.getDate() + nextRevisionDays);

            const updatedRevision = {
                ...revision,
                last_revised: today.toISOString().split('T')[0],
                next_revision: nextRevision.toISOString().split('T')[0],
                revision_count: revision.revision_count + 1
            };

            await updateRevisionProblem(updatedRevision);
            showNotification('Success', 'Problem marked as revised', 'green');
            loadRevisions();
        } catch (err) {
            console.error(err);
            showNotification('Error', 'Failed to update revision status', 'red');
        }
    };

    // Delete revision
    const handleDelete = async (revision: RevisionProblem) => {
        try {
            await deleteRevisionProblem(revision);
            showNotification('Success', 'Problem removed from revisions', 'green');
            loadRevisions();
        } catch (err) {
            console.error(err);
            showNotification('Error', 'Failed to delete revision problem', 'red');
        }
    };

    // Update revision
    const handleUpdateRevision = async () => {
        if (!editForm) return;

        try {
            await updateRevisionProblem(editForm);
            showNotification('Success', 'Revision problem updated successfully', 'green');
            closeEditModal();
            loadRevisions();
        } catch (err) {
            console.error(err);
            showNotification('Error', 'Failed to update revision problem', 'red');
        }
    };

    // Determine row color based on revision status
    const getRowColor = (revision: RevisionProblem) => {
        const today = new Date().toISOString().split('T')[0];

        if (revision.next_revision < today) {
            return 'rgba(255, 0, 0, 0.1)'; // Overdue - red
        } else if (revision.next_revision === today) {
            return 'rgba(255, 165, 0, 0.1)'; // Due today - orange
        }
        return undefined;
    };

    // Calculate confidence distribution
    const confidenceDistribution = [0, 0, 0, 0, 0];
    revisions.forEach(r => {
        if (r.confidence_level >= 1 && r.confidence_level <= 5) {
            confidenceDistribution[r.confidence_level - 1]++;
        }
    });

    // Get sorted revisions for timeline view (sorted by next revision date)
    const timelineRevisions = [...filteredRevisions].sort((a, b) =>
        new Date(a.next_revision).getTime() - new Date(b.next_revision).getTime()
    );

    if (loading && !refreshing) {
        return (
            <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
                <Loader size="xl" variant="dots" />
                <Text mt="md" fw={500} size="lg" c="dimmed">Loading your revision problems...</Text>
                <Text size="sm" c="dimmed" mt="xs">Preparing your study schedule</Text>
            </Container>
        );
    }

    const renderTableRow = (revision: RevisionProblem) => (
        <>
            <Table.Tr
                key={`row-${revision.title}`}
                style={{
                    backgroundColor: getRowColor(revision),
                    cursor: 'pointer'
                }}
                onClick={() => toggleRowExpansion(revision.title)}
            >
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                            variant="transparent"
                            color="gray"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(revision.title);
                            }}
                        >
                            <IconChevronDown size={16} style={{
                                transform: expandedRows[revision.title] ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s ease'
                            }} />
                        </ActionIcon>
                        <Text fw={500} truncate="end" style={{ maxWidth: 220 }} title={revision.title}>
                            {revision.title}
                        </Text>
                        {revision.notes && (
                            <Tooltip label="Has notes">
                                <ThemeIcon size="xs" variant="light" color="blue">
                                    <IconNotes size={10} />
                                </ThemeIcon>
                            </Tooltip>
                        )}
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Badge
                        color={
                            revision.difficulty === 'Easy' ? 'green' :
                                revision.difficulty === 'Medium' ? 'yellow' : 'red'
                        }
                        variant="filled"
                        radius="sm"
                    >
                        {revision.difficulty}
                    </Badge>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                        <IconHistory size={16} stroke={1.5} />
                        <Text size="sm">{new Date(revision.last_revised).toLocaleDateString()}</Text>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                        <IconCalendar size={16} stroke={1.5} color={
                            revision.next_revision < new Date().toISOString().split('T')[0] ? 'red' :
                                revision.next_revision === new Date().toISOString().split('T')[0] ? 'orange' : undefined
                        } />
                        <Text
                            size="sm"
                            c={
                                revision.next_revision < new Date().toISOString().split('T')[0] ? 'red' :
                                    revision.next_revision === new Date().toISOString().split('T')[0] ? 'orange' : undefined
                            }
                            fw={
                                revision.next_revision <= new Date().toISOString().split('T')[0] ? 'bold' : undefined
                            }
                        >
                            {new Date(revision.next_revision).toLocaleDateString()}
                        </Text>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs">
                        {Array(5).fill(0).map((_, i) => (
                            <IconStar
                                key={i}
                                size={16}
                                fill={i < revision.confidence_level ? 'currentColor' : 'none'}
                                color={i < revision.confidence_level ? '#FFD700' : '#ADB5BD'}
                            />
                        ))}
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Badge radius="sm" variant="light" color={
                        revision.revision_count === 0 ? 'gray' :
                            revision.revision_count < 3 ? 'blue' :
                                revision.revision_count < 5 ? 'indigo' : 'violet'
                    }>
                        {revision.revision_count}
                    </Badge>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                        {revision?.tags && revision.tags.length > 0 ? revision.tags.map((tag, index) => (
                            <Badge key={index} size="xs" variant="dot" color="blue">
                                {tag}
                            </Badge>
                        )).slice(0, 2) : "N/A"}
                        {revision?.tags && revision.tags.length > 2 && (
                            <Tooltip label={revision.tags.slice(2).join(', ')}>
                                <Badge size="xs" variant="outline" color="gray">
                                    +{revision.tags.length - 2}
                                </Badge>
                            </Tooltip>
                        )}
                    </Group>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                    <Group align="center" gap="xs">
                        <Tooltip label="Mark as Revised">
                            <ActionIcon color="green" variant="light" onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRevised(revision);
                            }}>
                                <IconCheck size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="View Code">
                            <ActionIcon color="blue" variant="light" onClick={(e) => {
                                e.stopPropagation();
                                handleViewCode(revision);
                            }}>
                                <IconCode size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Menu width={200} position="bottom-end" shadow="md">
                            <Menu.Target>
                                <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                                <Menu.Item
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => openEditModal(revision)}
                                    color="blue"
                                >
                                    Edit Details
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconGitCompare size={16} />}
                                    onClick={() => openComparisonModal(revision)}
                                    color="violet"
                                >
                                    Compare Solutions
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => handleDelete(revision)}
                                    color="red"
                                >
                                    Remove
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Table.Td>
            </Table.Tr>

            <Table.Tr key={`expanded-${revision.title}`} style={{ display: expandedRows[revision.title] ? 'table-row' : 'none' }}>
                <Table.Td colSpan={8}>
                    <Paper p="sm" withBorder radius="md" bg="rgba(0,0,0,0.02)" style={{ marginBottom: 10, marginTop: 5 }}>
                        <Grid>
                            <Grid.Col span={8}>
                                <Text fw={500} size="sm" mb={4}>Notes:</Text>
                                <Paper p="xs" withBorder radius="sm" bg="white" style={{ minHeight: '60px' }}>
                                    <Text size="sm">{revision.notes || "No notes available"}</Text>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Card p="xs" withBorder radius="sm">
                                    <Text fw={500} size="sm" mb={4}>Complexity:</Text>
                                    <Group>
                                        <Text size="sm" fw={500}>Time:</Text>
                                        <Text size="sm">{revision.currentTimeComplexity || "Not specified"}</Text>
                                    </Group>
                                    <Group mt="xs">
                                        <Text size="sm" fw={500}>Space:</Text>
                                        <Text size="sm">{revision.currentSpaceComplexity || "Not specified"}</Text>
                                    </Group>
                                </Card>
                            </Grid.Col>
                        </Grid>

                        <Group justify="right" mt="md">
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconEdit size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(revision);
                                }}
                            >
                                Edit Details
                            </Button>
                            <Button
                                size="xs"
                                variant="light"
                                color="blue"
                                leftSection={<IconCode size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewCode(revision);
                                }}
                            >
                                View Code
                            </Button>
                            <Button
                                size="xs"
                                variant="light"
                                color="violet"
                                leftSection={<IconGitCompare size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openComparisonModal(revision);
                                }}
                            >
                                Compare Solutions
                            </Button>
                        </Group>
                    </Paper>
                </Table.Td>
            </Table.Tr>
        </>
    );


    return (
        <Container fluid p="md" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Group mb="md" justify="space-between">
                <Group>
                    <Text fw={700} size="lg">Revision Problems</Text>
                    <Badge size="lg" variant="light" radius="sm" color="blue">
                        {filteredRevisions.length} of {revisions.length} problems
                    </Badge>
                </Group>

                <Group>
                    <Button
                        size="sm"
                        variant="light"
                        leftSection={<IconRefresh size={14} />}
                        onClick={loadRevisions}
                        loading={refreshing}
                        radius="md"
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Group>
            </Group>

            <Card shadow="sm" p="md" radius="md" withBorder mb="md">
                <Group justify="space-between" mb="sm">
                    <Text fw={500} size="sm">Filters & Search</Text>

                    <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'table' | 'timeline')}>
                        <Tabs.List>
                            <Tabs.Tab value="table" leftSection={<IconTags size={14} />}>Table View</Tabs.Tab>
                            <Tabs.Tab value="timeline" leftSection={<IconHistory size={14} />}>Timeline</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </Group>

                <Group mb="md">
                    <TextInput
                        placeholder="Search problems or tags"
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        style={{ width: '300px' }}
                        rightSection={
                            searchQuery ? (
                                <ActionIcon size="xs" onClick={() => setSearchQuery('')} radius="xl">
                                    <IconX size={14} />
                                </ActionIcon>
                            ) : null
                        }
                    />

                    <Button.Group>
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'filled' : 'outline'}
                            onClick={() => setFilter('all')}
                            radius="md"
                        >
                            All
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'due' ? 'filled' : 'outline'}
                            color="orange"
                            onClick={() => setFilter('due')}
                            leftSection={<IconClockHour4 size={14} />}
                            radius="md"
                        >
                            Due Today
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'overdue' ? 'filled' : 'outline'}
                            color="red"
                            onClick={() => setFilter('overdue')}
                            leftSection={<IconAlertCircle size={14} />}
                            radius="md"
                        >
                            Overdue
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'upcoming' ? 'filled' : 'outline'}
                            color="blue"
                            onClick={() => setFilter('upcoming')}
                            leftSection={<IconCalendar size={14} />}
                            radius="md"
                        >
                            Upcoming
                        </Button>
                    </Button.Group>
                </Group>
            </Card>

            {filteredRevisions.length === 0 ? (
                <Paper p="xl" radius="md" withBorder shadow="sm">
                    <Center style={{ flexDirection: 'column', padding: '40px 0' }}>
                        <ThemeIcon size={60} radius="xl" color="blue" variant="light">
                            <IconBookmark size={30} />
                        </ThemeIcon>
                        <Text fw={500} size="lg" mt="md">No revision problems found</Text>
                        <Text c="dimmed" size="sm" mt="xs" style={{ maxWidth: 400, textAlign: 'center' }}>
                            {searchQuery || filter !== 'all'
                                ? "Try adjusting your search or filters to find more problems."
                                : "Start adding problems to your revision list from the submissions tab."}
                        </Text>
                    </Center>
                </Paper>
            ) : (
                <>
                    {activeTab === 'table' ? (
                        <Paper withBorder shadow="md" radius="md" style={{ overflow: 'hidden' }}>
                            <ScrollArea style={{ maxHeight: 'calc(90vh - 350px)', overflowY: 'auto' }}>
                                <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md" stickyHeader stickyHeaderOffset={0}>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th style={{ fontWeight: 600 }}>Problem</Table.Th>
                                            <Table.Th style={{ fontWeight: 600 }}>Difficulty</Table.Th>
                                            <Table.Th style={{ fontWeight: 600 }}>Last Revised</Table.Th>
                                            <Table.Th style={{ fontWeight: 600 }}>Next Revision</Table.Th>
                                            <Table.Th style={{ fontWeight: 600 }}>Confidence</Table.Th>
                                            <Table.Th style={{ fontWeight: 600 }}>Count</Table.Th>
                                            <Table.Th style={{ fontWeight: 600 }}>Tags</Table.Th>
                                            <Table.Th style={{ fontWeight: 600, textAlign: 'center' }}>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredRevisions?.map(renderTableRow)}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Paper>
                    ) : (
                        <Paper withBorder shadow="md" radius="md" p="lg" style={{ overflow: 'hidden' }}>
                            <ScrollArea style={{ maxHeight: 'calc(90vh - 350px)', overflowY: 'auto' }}>
                                <Timeline active={-1} bulletSize={24} lineWidth={2}>
                                    {timelineRevisions?.map((revision, index) => (
                                        <Timeline.Item
                                            key={index}
                                            title={
                                                <Group gap="xs">
                                                    <Text fw={500}>{revision.title}</Text>
                                                    <Badge
                                                        color={
                                                            revision.difficulty === 'Easy' ? 'green' :
                                                                revision.difficulty === 'Medium' ? 'yellow' : 'red'
                                                        }
                                                        variant="light"
                                                        size="xs"
                                                    >
                                                        {revision.difficulty}
                                                    </Badge>
                                                </Group>
                                            }
                                            bullet={
                                                <ThemeIcon
                                                    size={24}
                                                    radius="xl"
                                                    color={
                                                        revision.next_revision < new Date().toISOString().split('T')[0] ? 'red' :
                                                            revision.next_revision === new Date().toISOString().split('T')[0] ? 'orange' : 'blue'
                                                    }
                                                >
                                                    {revision.next_revision < new Date().toISOString().split('T')[0] ? (
                                                        <IconAlertCircle size={16} />
                                                    ) : revision.next_revision === new Date().toISOString().split('T')[0] ? (
                                                        <IconClockHour4 size={16} />
                                                    ) : (
                                                        <IconCalendar size={16} />
                                                    )}
                                                </ThemeIcon>
                                            }
                                        >
                                            <Card shadow="sm" p="md" radius="md" mt="xs" withBorder>
                                                <Group justify="space-between" mb="xs">
                                                    <Group>
                                                        <Text size="sm" c="dimmed">Review on:</Text>
                                                        <Text fw={600} size="sm" c={
                                                            revision.next_revision < new Date().toISOString().split('T')[0] ? 'red' :
                                                                revision.next_revision === new Date().toISOString().split('T')[0] ? 'orange' : undefined
                                                        }>
                                                            {new Date(revision.next_revision).toLocaleDateString()}
                                                        </Text>
                                                    </Group>

                                                    <Button
                                                        variant="light"
                                                        color="green"
                                                        size="xs"
                                                        leftSection={<IconCheck size={14} />}
                                                        onClick={() => handleMarkRevised(revision)}
                                                    >
                                                        Mark as Revised
                                                    </Button>
                                                </Group>

                                                <Group justify="space-between" mb="sm">
                                                    <Group>
                                                        <Text size="sm">Last revised:</Text>
                                                        <Text size="sm">{new Date(revision.last_revised).toLocaleDateString()}</Text>
                                                    </Group>
                                                    <Group>
                                                        <Text size="sm">Revisions:</Text>
                                                        <Badge size="sm" variant="light">{revision.revision_count}</Badge>
                                                    </Group>
                                                </Group>

                                                <Group mb="xs">
                                                    <Text size="sm">Confidence:</Text>
                                                    <Group gap="xs">
                                                        {Array(5).fill(0).map((_, i) => (
                                                            <IconStar
                                                                key={i}
                                                                size={14}
                                                                fill={i < revision.confidence_level ? 'currentColor' : 'none'}
                                                                color={i < revision.confidence_level ? '#FFD700' : '#ADB5BD'}
                                                            />
                                                        ))}
                                                    </Group>
                                                </Group>

                                                {revision.notes && (
                                                    <Paper p="xs" radius="sm" bg="rgba(0,0,0,0.03)" withBorder mt="sm">
                                                        <Text size="xs" fw={500} mb={4}>Notes:</Text>
                                                        <Text size="xs">{revision.notes}</Text>
                                                    </Paper>
                                                )}

                                                <Group justify="space-between" mt="md">
                                                    <Group gap="xs">
                                                        {revision?.tags && revision.tags.length > 0 ? revision.tags.map((tag, index) => (
                                                            <Badge key={index} size="xs" variant="dot" color="blue">
                                                                {tag}
                                                            </Badge>
                                                        )) : "N/A"}
                                                    </Group>

                                                    <Group gap="xs">
                                                        <Tooltip label="View Code">
                                                            <ActionIcon color="blue" variant="subtle" onClick={() => handleViewCode(revision)}>
                                                                <IconCode size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Edit">
                                                            <ActionIcon color="gray" variant="subtle" onClick={() => openEditModal(revision)}>
                                                                <IconEdit size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Compare Solutions">
                                                            <ActionIcon color="violet" variant="subtle" onClick={() => openComparisonModal(revision)}>
                                                                <IconGitCompare size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                </Group>
                                            </Card>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </ScrollArea>
                        </Paper>
                    )}
                </>
            )}

            {/* Code Modal */}
            {selectedRevision && (
                <CodeModal
                    opened={codeModalOpened}
                    onClose={closeCodeModal}
                    submission={selectedRevision}
                />
            )}

            {/* Edit Modal */}
            <Modal
                opened={editModalOpened}
                onClose={closeEditModal}
                title={
                    <Group gap="md">
                        <IconEdit size={20} stroke={1.5} />
                        <Text fw={600}>Edit Revision Problem</Text>
                    </Group>
                }
                size="lg"
                radius="md"
                centered
            >
                {editForm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <Paper p="sm" withBorder radius="md" mb="sm" bg="rgba(0,0,0,0.02)">
                            <Text fw={700}>{editForm.title}</Text>
                            <Group mt="xs">
                                <Badge variant="outline" color="blue" radius="sm">
                                    {editForm.lang_name}
                                </Badge>
                                {editForm.isBestSolution && (
                                    <Badge color="green" variant="light" radius="sm">
                                        Optimal Solution
                                    </Badge>
                                )}
                            </Group>
                        </Paper>

                        <Select
                            label="Difficulty"
                            description="Select the difficulty level of this problem"
                            value={editForm.difficulty}
                            onChange={(value) => setEditForm({ ...editForm, difficulty: value || 'Medium' })}
                            data={[
                                { value: 'Easy', label: 'Easy' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'Hard', label: 'Hard' }
                            ]}
                            leftSection={<IconFlag size={16} />}
                        />

                        <NumberInput
                            label="Confidence Level"
                            description="How confident do you feel about solving this problem? (1-5)"
                            value={editForm.confidence_level}
                            onChange={(value) => setEditForm({ ...editForm, confidence_level: Number(value) || 3 })}
                            min={1}
                            max={5}
                            leftSection={<IconStar size={16} />}
                        />

                        <Textarea
                            label="Notes"
                            description="Add your notes, insights or reminders for this problem"
                            placeholder="E.g., Remember to check for edge cases with empty arrays. Use two pointers for optimization."
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            minRows={4}
                            leftSection={<IconInfoCircle size={16} />}
                        />

                        <TextInput
                            label="Tags"
                            description="Categorize this problem with comma-separated tags"
                            placeholder="E.g., binary-search, arrays, two-pointers"
                            value={editForm.tags.join(', ')}
                            onChange={(e) => setEditForm({
                                ...editForm,
                                tags: e.target.value.split(',')?.map(tag => tag.trim()).filter(Boolean)
                            })}
                            leftSection={<IconTags size={16} />}
                        />

                        <Group justify="space-between" mt="lg">
                            <Button variant="subtle" onClick={closeEditModal} color="gray">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateRevision}
                                leftSection={<IconCheck size={16} />}
                                style={{
                                    backgroundImage: 'linear-gradient(45deg, #4d7cff, #7c5bf1)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Save Changes
                            </Button>
                        </Group>
                    </div>
                )}
            </Modal>

            {/* Solution Comparison Modal */}
            {selectedRevision && (
                <SolutionComparison
                    opened={comparisonOpened}
                    onClose={closeComparisonModal}
                    submission={selectedRevision}
                />
            )}
        </Container>
    );
}