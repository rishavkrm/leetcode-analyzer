import { useState, useEffect } from 'react';
import {
    Paper, Title, Tabs, Text, Stack, Badge, Card, Group, Button, Table,
    Select, Box, ActionIcon, Container, Divider, Tooltip, Avatar, ScrollArea
} from '@mantine/core';
import {
    IconBulb, IconCode, IconTemplate, IconBrandLeetcode,
    IconCheck, IconCopy, IconBook
} from '@tabler/icons-react';
import { Prism } from '@mantine/prism';
import { fetchPatternInfo } from '../functions/helpers';
import type { PatternInfo } from '../types/types';
import MarkdownRenderer from './MarkdownRenderer';

function LearningHub() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>('');
    const [selectedPattern, setSelectedPattern] = useState<string | null>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('go');
    const [activeTab, setActiveTab] = useState<string | null>('topics');
    const [patternInfo, setPatternInfo] = useState<PatternInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Same topic patterns as before...
    const topicPatterns = {
        "Arrays": [
            "Basic traversals",
            "Two Sum variations",
            "Kadane's Algorithm (Max Subarray Sum)",
            "Prefix Sum / Suffix Sum",
            "Rotation",
            "Dutch National Flag",
            "Finding Duplicates/Missing Numbers (without extra space if possible)",
            "Product of Array Except Self"
        ],
        "Strings": [
            "Palindrome checks",
            "Anagrams",
            "Longest Substring/Subsequence variations",
            "String matching (e.g., KMP - though less common in basic rounds)",
            "String to Integer (atoi) / Integer to String",
            "Valid Parentheses/Brackets"
        ],
        "Two Pointers": [
            "Same Direction (e.g., removing duplicates from sorted array)",
            "Opposite Directions (e.g., 2-Sum in a sorted array, reverse string/array)",
            "Pair with Target Sum",
            "Triplet/Quadruplet Sum",
            "Comparing strings with backspaces",
            "Minimum Window Sort"
        ],
        "Fast and Slow Pointers": [
            "Detecting cycles in Linked Lists (Floyd's Tortoise and Hare)",
            "Finding the middle of a Linked List",
            "Happy Number",
            "Palindrome Linked List",
            "Rearrange a Linked List",
            "Cycle in a Circular Array"
        ],
        "Sliding Window": [
            "Fixed Size Window (e.g., Max/Min sum subarray of size K)",
            "Variable Size Window (e.g., Smallest subarray with a given sum, Longest substring with K distinct characters)",
            "Frequency map within window",
            "Permutation in a String",
            "String Anagrams",
            "Smallest Window containing Substring"
        ],
        "Merge Intervals": [
            "Merging overlapping intervals",
            "Inserting an interval",
            "Finding intersections",
            "Handling non-overlapping intervals",
            "Minimum Meeting Rooms",
            "Employee Free Time"
        ],
        "In-Place Manipulation of a Linked List": [
            "Reversing a Linked List (iterative, recursive)",
            "Reversing a sub-list",
            "Reversing every K-element sub-list",
            "Rotating a Linked List"
        ],
        "Linked List": [
            "Singly vs Doubly Linked Lists",
            "Basic operations (add, remove, find)",
            "Dummy head technique",
            "Recursive solutions",
            "Cloning a linked list (with random pointers)",
            "Odd Even Linked List"
        ],
        "Heaps": [ // (Priority Queues)
            "Min-Heap vs Max-Heap",
            "Finding Kth smallest/largest element",
            "Median from a Data Stream (Two Heaps)",
            "Merge K Sorted Lists (related to K-way merge)",
            "Top K Frequent Elements",
            "Scheduling problems (e.g., CPU Load)"
        ],
        "K-way merge": [
            "Merging K sorted arrays/lists",
            "Smallest Number Range covering elements from K lists",
            "Kth Smallest Number in M Sorted Lists"
        ],
        "Top K Elements": [
            "Finding K largest/smallest numbers",
            "K closest points to origin",
            "Top K frequent numbers/strings",
            "K closest numbers in a sorted array"
        ],
        "Modified Binary Search": [
            "Search in a Sorted Array (classic)",
            "Order-agnostic Search",
            "Ceiling/Floor of a number",
            "Next Letter/Smallest letter greater than target",
            "Number Range / First and Last Position",
            "Search in a Rotated Sorted Array (with or without duplicates)",
            "Search in a Bitonic Array",
            "Peak Finding"
        ],
        "Binary Search Tree (BST)": [
            "Properties of BST",
            "Insertion, Deletion, Search",
            "Validation (Is it a BST?)",
            "Lowest Common Ancestor (LCA) in BST",
            "Kth smallest/largest element in BST",
            "Convert Sorted Array/List to BST",
            "Inorder, Preorder, Postorder traversal (and their significance in BST)"
        ],
        "Subsets": [
            "Generating all subsets (Power Set)",
            "Subsets with Duplicates",
            "Permutations (with/without duplicates)",
            "Combinations",
            "Letter Case Permutation",
            "Generate Parentheses"
        ],
        "Greedy Techniques": [
            "Activity Selection Problem",
            "Fractional Knapsack",
            "Huffman Coding (conceptual)",
            "Coin Change (certain variations)",
            "Jump Game",
            "Task Scheduler"
        ],
        "Backtracking": [
            "N-Queens",
            "Sudoku Solver",
            "Word Search",
            "Combination Sum",
            "Permutations/Subsets (can also be solved this way)",
            "Palindrome Partitioning",
            "Recursive call stack management"
        ],
        "Dynamic Programming": [
            "Memoization (Top-Down)",
            "Tabulation (Bottom-Up)",
            "Fibonacci sequence variations",
            "Climbing Stairs",
            "Knapsack (0/1, Unbounded, Fractional)",
            "Longest Common Substring/Subsequence (LCS)",
            "Longest Increasing Subsequence (LIS)",
            "Edit Distance",
            "Coin Change (min coins, number of ways)",
            "House Robber",
            "Word Break",
            "Unique Paths"
        ],
        "Cyclic Sort": [
            "Sorting an array with numbers in a specific range (e.g., 1 to N)",
            "Find the Missing Number",
            "Find All Missing Numbers",
            "Find the Duplicate Number",
            "Find All Duplicate Numbers",
            "Find the Corrupt Pair (Duplicate and Missing)"
        ],
        "Topological Sort": [
            "Directed Acyclic Graphs (DAG)",
            "Using Kahn's Algorithm (BFS with in-degrees)",
            "Using DFS with recursion stack",
            "Course Schedule / Alien Dictionary",
            "Task Scheduling Order"
        ],
        "Sort and Search": [ // This is broad; often overlaps with "Modified Binary Search" and sorting algos
            "Basic Sorting Algorithms (Bubble, Insertion, Selection - know concepts, not always for implementation)",
            "Efficient Sorting Algorithms (Merge Sort, Quick Sort, Heap Sort - know concepts and be able to implement Merge/Quick)",
            "Custom Sort / Comparators",
            "Searching in sorted 2D matrix"
        ],
        "Matrices": [
            "Traversal (Spiral, Diagonal)",
            "Rotation (90 degrees)",
            "Setting Zeroes",
            "Searching in a sorted matrix",
            "Number of Islands (often uses DFS/BFS on matrix)",
            "Word Search (often uses Backtracking/DFS on matrix)"
        ],
        "Stacks": [
            "LIFO principle",
            "Balancing parentheses/brackets",
            "Next Greater/Smaller Element (Monotonic Stack)",
            "Implementing Queues using Stacks",
            "Expression evaluation (infix, postfix, prefix)",
            "Simplify Path",
            "Iterative DFS"
        ],
        "Queues": [
            "FIFO principle",
            "Implementing Stacks using Queues",
            "Level Order Traversal (BFS) in Trees/Graphs",
            "Sliding Window Maximum (using Deque)",
            "Number of recent calls"
        ],
        "Graphs": [
            "Representations (Adjacency List, Adjacency Matrix)",
            "Graph Traversal: Breadth-First Search (BFS)",
            "Graph Traversal: Depth-First Search (DFS)",
            "Connected Components",
            "Cycle Detection (Directed and Undirected)",
            "Shortest Path (e.g., Dijkstra's, Bellman-Ford - conceptual for interviews, BFS for unweighted)",
            "Minimum Spanning Tree (e.g., Prim's, Kruskal's - conceptual)",
            "Clone Graph",
            "Word Ladder"
        ],
        "Tree Depth-First Search": [
            "Pre-order, In-order, Post-order traversals (Recursive and Iterative)",
            "Path Sum variations",
            "Diameter of a Binary Tree",
            "Lowest Common Ancestor (LCA)",
            "All Paths for a Sum",
            "Count Paths for a Sum",
            "Serialize and Deserialize Binary Tree"
        ],
        "Tree Breadth-First Search": [
            "Level Order Traversal",
            "Zigzag/Spiral Traversal",
            "Minimum Depth of a Binary Tree",
            "Level Averages",
            "Connect Level Order Siblings / Populate Next Right Pointers",
            "Right View of Binary Tree"
        ],
        "Trie": [
            "Prefix matching",
            "Autocomplete / Typeahead",
            "Word Search (can be optimized with Trie)",
            "Implement Trie (Prefix Tree)",
            "Add and Search Word - Data structure design"
        ],
        "Hash Maps": [ // (Hash Tables)
            "Key-Value storage and retrieval",
            "Handling Collisions (conceptual understanding)",
            "Frequency counting",
            "Two Sum problem",
            "Group Anagrams",
            "LRU Cache (often uses HashMap + Doubly Linked List)",
            "Finding duplicates"
        ],
        "Knowing What to Track": [
            "Identifying necessary variables/state",
            "Choosing appropriate data structures for tracking",
            "Example: Character frequencies, running sums, visited nodes, current path"
        ],
        "Union Find": [ // (Disjoint Set Union - DSU)
            "Finding connected components efficiently",
            "Path compression and Union by rank/size optimizations",
            "Number of Islands II",
            "Graph Valid Tree",
            "Redundant Connection"
        ],
        "Custom Data Structures": [
            "Implementing a class with specific methods (e.g., LRU Cache, Min Stack)",
            "Combining existing data structures to solve a problem efficiently"
        ],
        "Bitwise Manipulation": [
            "Basic operators (AND, OR, XOR, NOT, Left Shift, Right Shift)",
            "Setting/Clearing/Getting a bit",
            "Finding single non-repeating element",
            "Counting set bits (Hamming Weight)",
            "Power of 2 check",
            "Flipping bits",
            "Bitwise XOR properties (a^a=0, a^0=a)"
        ],
        "Math and Geometry": [
            "Prime numbers (Sieve of Eratosthenes)",
            "Greatest Common Divisor (GCD) / Least Common Multiple (LCM)",
            "Factorials, Permutations, Combinations (math formulas)",
            "Base conversions",
            "Coordinate geometry (distance, slope, intersections)",
            "Handling large numbers",
            "Reservoir Sampling (conceptual)"
        ],
        "Recursion": [
            "Base case definition",
            "Recursive step definition",
            "Understanding call stack",
            "Divide and Conquer (e.g., Merge Sort, Quick Sort)",
            "Many tree and graph problems",
            "Backtracking problems inherently use recursion"
        ],
        "Design": [ // This can be a broad category
            "Designing simple data structures (e.g., MinStack, LRUCache, TicTacToe)",
            "Object-Oriented Design principles (briefly, if applicable)",
            "API design considerations (simple cases)"
        ]
    };

    const topics = Object.keys(topicPatterns).map((topic) => ({
        value: topic,
        label: topic,
    }));

    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'go', label: 'Go' },
    ];

    const getPatternInfo = async () => {
        if (!selectedTopic || !selectedPattern) return;
        setLoading(true);
        try {
            const response = await fetchPatternInfo(selectedPattern, selectedLanguage);
            setPatternInfo(response.data);
            setTemplate(response.data.template);
        }
        catch (error) {
            console.error("Error fetching pattern info:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyTemplate = () => {
        if (template) {
            navigator.clipboard.writeText(template);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Container size="xl" py="md" px={isMobile ? "xs" : "xl"} style={{ width: isMobile ? "100%" : "75vw" }}>
            <Paper
                withBorder
                shadow="md"
                radius="lg"
                p={isMobile ? "md" : "xl"}
                style={{
                    background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
                    borderColor: '#e2e8f0'
                }}
            >
                <Box>
                    <Group gap={12} mb={8} wrap="nowrap">
                        <Avatar
                            radius="xl"
                            size={isMobile ? 40 : 50}
                            gradient={{ from: '#6366f1', to: '#8b5cf6', deg: 45 }}
                        >
                            <IconBook size={isMobile ? 20 : 30} color="#8b5cf6" />
                        </Avatar>
                        <Title
                            order={2}
                            size={isMobile ? "h3" : "h2"}
                            style={{
                                fontWeight: 800,
                                backgroundImage: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}
                        >
                            {isMobile ? "Pattern Explorer" : "Algorithm Pattern Explorer"}
                        </Title>
                    </Group>
                    <Text color="dimmed" size={isMobile ? "md" : "lg"} style={{ maxWidth: 600 }}>
                        Learn patterns, generate code templates, and master algorithms
                    </Text>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    styles={{
                        // 
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        tabsList: {
                            flexWrap: 'wrap',
                            rowGap: '8px',
                        },
                        tabLabel: {
                            fontWeight: 600,
                            fontSize: isMobile ? '0.9rem' : '1rem',
                        },
                        tab: {
                            padding: isMobile ? '8px 12px' : undefined,
                            borderRadius: '8px 8px 0 0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            },
                            '&[data-active]': {
                                borderBottomColor: '#3b82f6',
                                color: '#3b82f6'
                            }
                        }
                    }}
                >
                    <Tabs.List>
                        <Tabs.Tab value="topics" leftSection={<IconBulb size={isMobile ? 16 : 18} />}>
                            {isMobile ? "Patterns" : "Algorithm Patterns"}
                        </Tabs.Tab>
                        <Tabs.Tab value="templates" leftSection={<IconTemplate size={isMobile ? 16 : 18} />}>
                            {isMobile ? "Code" : "Code Templates"}
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="topics" pt={isMobile ? "md" : "xl"}>
                        <Stack style={{ gap: 'var(--mantine-spacing-lg)' }}>
                            <Card
                                withBorder
                                radius="md"
                                shadow="sm"
                                p={isMobile ? "md" : "lg"}
                                style={{
                                    borderColor: '#e2e8f0',
                                    backgroundColor: 'white'
                                }}
                            >
                                <Stack>
                                    <Select
                                        label="Select Topic"
                                        placeholder="Choose a topic"
                                        data={topics}
                                        value={selectedTopic}
                                        onChange={(value) => {
                                            setSelectedTopic(value);
                                            setSelectedPattern(null);
                                            setPatternInfo(null);
                                        }}
                                        styles={{
                                            label: { fontWeight: 600, marginBottom: 8, color: '#334155' }
                                        }}
                                    />

                                    <Select
                                        label="Select Pattern"
                                        placeholder={selectedTopic ? "Choose a pattern" : "Select a topic first"}
                                        data={selectedTopic ? topicPatterns[selectedTopic as keyof typeof topicPatterns] : []}
                                        value={selectedPattern}
                                        onChange={setSelectedPattern}
                                        disabled={!selectedTopic}
                                        styles={{
                                            label: { fontWeight: 600, marginBottom: 8, color: '#334155' }
                                        }}
                                    />

                                    <Button
                                        onClick={getPatternInfo}
                                        disabled={!selectedTopic || !selectedPattern}
                                        loading={loading}
                                        color="blue"
                                        size={isMobile ? "sm" : "md"}
                                        fullWidth
                                        radius="md"
                                        style={{
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                                            marginTop: isMobile ? 12 : 20,
                                        }}
                                    >
                                        Explore Pattern
                                    </Button>
                                </Stack>
                            </Card>

                            {patternInfo && (
                                <Card
                                    withBorder
                                    shadow="sm"
                                    radius="md"
                                    p={isMobile ? "md" : "xl"}
                                    style={{
                                        borderColor: '#e2e8f0',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <Stack gap={isMobile ? "md" : "lg"}>
                                        <Group justify="space-between" wrap="wrap" gap="xs">
                                            <Title order={3} size={isMobile ? "h4" : "h3"} style={{ color: '#334155', fontWeight: 700 }}>
                                                {patternInfo.name}
                                            </Title>
                                            <Badge
                                                size={isMobile ? "md" : "lg"}
                                                radius="md"
                                                color={
                                                    patternInfo.priority === 'High' ? 'red' :
                                                        patternInfo.priority === 'Medium' ? 'yellow' : 'blue'
                                                }
                                                style={{ padding: isMobile ? '6px 12px' : '8px 16px', fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                                            >
                                                {patternInfo.priority} Priority
                                            </Badge>
                                        </Group>

                                        <Box style={{
                                            fontSize: isMobile ? '0.95rem' : '1.05rem',
                                            lineHeight: 1.6
                                        }}>
                                            <MarkdownRenderer content={patternInfo.description} />
                                        </Box>

                                        <Divider />

                                        <Title order={4} size={isMobile ? "h5" : "h4"} style={{ color: '#334155', fontWeight: 700 }}>
                                            Summary
                                        </Title>
                                        <ScrollArea>
                                            <Table striped withTableBorder style={{
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                minWidth: isMobile ? 300 : 'auto'
                                            }}>
                                                <Table.Tbody>
                                                    <Table.Tr>
                                                        <Table.Td style={{ backgroundColor: '#f8fafc', width: isMobile ? 120 : 180 }}>
                                                            <Text fw={700} size={isMobile ? "sm" : "md"}>Category</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size={isMobile ? "sm" : "md"}>{patternInfo.category}</Text>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                    <Table.Tr>
                                                        <Table.Td style={{ backgroundColor: '#f8fafc' }}>
                                                            <Text fw={700} size={isMobile ? "sm" : "md"}>Why This Priority</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size={isMobile ? "sm" : "md"}>{patternInfo.whyPriority}</Text>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                </Table.Tbody>
                                            </Table>
                                        </ScrollArea>

                                        <Title order={4} size={isMobile ? "h5" : "h4"} style={{ color: '#334155', fontWeight: 700 }}>
                                            Key Points
                                        </Title>
                                        <Card
                                            withBorder={false}
                                            radius="md"
                                            bg="#f8fafc"
                                            p={isMobile ? "sm" : "md"}
                                        >
                                            <ul style={{
                                                paddingLeft: isMobile ? '1.2rem' : '1.5rem',
                                                margin: 0,
                                                fontSize: isMobile ? '0.9rem' : 'inherit'
                                            }}>
                                                {patternInfo.keyPoints.map((point, index) => (
                                                    <li key={index} style={{ marginBottom: '8px' }}>
                                                        <MarkdownRenderer content={point} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>

                                        <Title order={4} size={isMobile ? "h5" : "h4"} style={{ color: '#334155', fontWeight: 700 }}>
                                            Representative Problems
                                        </Title>
                                        <ScrollArea>
                                            <Box style={{ minWidth: 350 }}>
                                                <Table striped withTableBorder style={{
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th style={{ backgroundColor: '#f1f5f9' }}>
                                                                <Text size={isMobile ? "sm" : "md"}>Problem</Text>
                                                            </Table.Th>
                                                            <Table.Th style={{ backgroundColor: '#f1f5f9' }}>
                                                                <Text size={isMobile ? "sm" : "md"}>Difficulty</Text>
                                                            </Table.Th>
                                                            <Table.Th style={{ backgroundColor: '#f1f5f9' }}>
                                                                <Text size={isMobile ? "sm" : "md"}>Action</Text>
                                                            </Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {patternInfo.questions.map(question => (
                                                            <Table.Tr key={question.id}>
                                                                <Table.Td>
                                                                    <Text size={isMobile ? "sm" : "md"}>{question.title}</Text>
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    <Badge
                                                                        color={
                                                                            question.difficulty === 'Easy' ? 'green' :
                                                                                question.difficulty === 'Medium' ? 'yellow' : 'red'
                                                                        }
                                                                        variant="light"
                                                                        radius="md"
                                                                        size={isMobile ? "sm" : "md"}
                                                                    >
                                                                        {question.difficulty}
                                                                    </Badge>
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    <Button
                                                                        component="a"
                                                                        href={question.url}
                                                                        target="_blank"
                                                                        size="xs"
                                                                        variant="light"
                                                                        rightSection={<IconBrandLeetcode size={14} />}
                                                                        radius="md"
                                                                        style={{ fontWeight: 600 }}
                                                                    >
                                                                        Solve
                                                                    </Button>
                                                                </Table.Td>
                                                            </Table.Tr>
                                                        ))}
                                                    </Table.Tbody>
                                                </Table>
                                            </Box>
                                        </ScrollArea>

                                        <Title order={4} size={isMobile ? "h5" : "h4"} style={{ color: '#334155', fontWeight: 700 }}>
                                            Common Mistakes
                                        </Title>
                                        <Card
                                            withBorder={false}
                                            radius="md"
                                            bg="#fff1f2"
                                            p={isMobile ? "sm" : "md"}
                                            style={{ borderLeft: '4px solid #f43f5e' }}
                                        >
                                            <ul style={{
                                                paddingLeft: isMobile ? '1.2rem' : '1.5rem',
                                                margin: 0,
                                                fontSize: isMobile ? '0.9rem' : 'inherit'
                                            }}>
                                                {patternInfo.commonMistakes.map((mistake, index) => (
                                                    <li key={index} style={{ marginBottom: '8px' }}>
                                                        <MarkdownRenderer content={mistake} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="templates" pt={isMobile ? "md" : "xl"}>
                        <Stack gap={isMobile ? "md" : "lg"}>
                            <Card
                                withBorder
                                radius="md"
                                shadow="sm"
                                p={isMobile ? "md" : "lg"}
                                style={{
                                    borderColor: '#e2e8f0',
                                    backgroundColor: 'white'
                                }}
                            >
                                <Stack gap={isMobile ? "xs" : "md"}>
                                    <Select
                                        label="Select Topic"
                                        placeholder="Choose a topic"
                                        data={topics}
                                        value={selectedTopic}
                                        onChange={(value) => {
                                            setSelectedTopic(value);
                                            setSelectedPattern(null);
                                            setTemplate(null);
                                        }}
                                        styles={{
                                            label: { fontWeight: 600, marginBottom: 8, color: '#334155' }
                                        }}
                                    />

                                    <Select
                                        label="Select Pattern"
                                        placeholder={selectedTopic ? "Choose a pattern" : "Select a topic first"}
                                        data={selectedTopic ? topicPatterns[selectedTopic as keyof typeof topicPatterns] : []}
                                        value={selectedPattern}
                                        onChange={(value) => {
                                            setSelectedPattern(value);
                                            setTemplate(null);
                                        }}
                                        disabled={!selectedTopic}
                                        styles={{
                                            label: { fontWeight: 600, marginBottom: 8, color: '#334155' }
                                        }}
                                    />

                                    <Select
                                        label="Programming Language"
                                        placeholder="Select language"
                                        data={languages}
                                        value={selectedLanguage}
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        onChange={setSelectedLanguage}
                                        styles={{
                                            label: { fontWeight: 600, marginBottom: 8, color: '#334155' }
                                        }}
                                    />

                                    <Button
                                        onClick={() => { getPatternInfo() }}
                                        disabled={!selectedTopic || !selectedPattern || !selectedLanguage}
                                        leftSection={<IconCode size={isMobile ? 16 : 18} />}
                                        loading={loading}
                                        color="blue"
                                        size={isMobile ? "sm" : "md"}
                                        fullWidth
                                        mt={isMobile ? "sm" : "lg"}
                                        radius="md"
                                        style={{
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                                        }}
                                    >
                                        Generate Template
                                    </Button>
                                </Stack>
                            </Card>

                            {template && (
                                <Card
                                    withBorder
                                    shadow="sm"
                                    radius="md"
                                    p={isMobile ? "md" : "xl"}
                                    style={{
                                        borderColor: '#e2e8f0',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
                                        <Title order={4} size={isMobile ? "h5" : "h4"} style={{ color: '#334155', fontWeight: 700 }}>
                                            {isMobile ?
                                                `${selectedPattern?.substring(0, 16)}${selectedPattern && selectedPattern.length > 16 ? '...' : ''}` :
                                                `Template for ${selectedPattern}`}
                                        </Title>
                                        <Group gap="xs">
                                            {!isMobile && <Badge>{selectedLanguage}</Badge>}
                                            <Tooltip label={copied ? "Copied!" : "Copy to clipboard"}>
                                                <ActionIcon
                                                    onClick={handleCopyTemplate}
                                                    size="lg"
                                                    radius="md"
                                                    variant="light"
                                                    color={copied ? "teal" : "gray"}
                                                >
                                                    {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Group>

                                    <Box mb="md" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                        <ScrollArea>
                                            <Prism
                                                colorScheme="dark"
                                                language={selectedLanguage === 'python' ? 'python' : 'javascript'}
                                                withLineNumbers
                                                styles={{
                                                    code: {
                                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                                    }
                                                }}
                                            >
                                                {template}
                                            </Prism>
                                        </ScrollArea>
                                    </Box>
                                </Card>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Container>
    );
}

export default LearningHub;