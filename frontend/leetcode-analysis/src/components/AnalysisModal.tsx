import { Modal, Stack, Loader, ScrollArea, Accordion, Title, Paper, SimpleGrid, Box, Badge, Text } from "@mantine/core";
import type { AnalysisReport } from "../types/types";
import MarkdownRenderer from "./MarkdownRenderer";


interface AnalysisModalProps {
    opened: boolean;
    onClose: () => void;
    analysisReport: AnalysisReport | null;
    isLoading: boolean;
    submissionTitle?: string;
}

function AnalysisModal({ opened, onClose, analysisReport, isLoading, submissionTitle }: AnalysisModalProps) {
    if (isLoading) {
        return (
            <Modal opened={opened} onClose={onClose} size="100%" title={`Analyzing: ${submissionTitle || 'Submission'}`} centered>
                <Stack align="center" p="xl">
                    <Loader size="lg" />
                    <Text>Fetching analysis, please wait...</Text>
                </Stack>
            </Modal>
        );
    }

    if (!analysisReport) return null;

    const {
        correctnessAndLogic,
        timeComplexityAnalysis,
        spaceComplexityAnalysis,
        codeStyleAndReadability,
        alternativeApproaches,
        summary,
    } = analysisReport;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Analysis for: ${submissionTitle || 'Submission'}`}
            size="xl"
            scrollAreaComponent={ScrollArea.Autosize}
            centered
        >
            <Accordion defaultValue={['summary', 'correctnessAndLogic']} multiple>
                <Accordion.Item value="summary">
                    <Accordion.Control>
                        <Title order={5}>Summary</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Paper p="md" withBorder radius="md">
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <Box>
                                    <Text fw={500}>Current Time Complexity:</Text>
                                    <Badge color="blue" variant="light" size="lg">{summary.currentTimeComplexity}</Badge>
                                </Box>
                                <Box>
                                    <Text fw={500}>Best Possible Time Complexity:</Text>
                                    <Badge color="green" variant="light" size="lg">{summary.bestTimeComplexity}</Badge>
                                </Box>
                                <Box>
                                    <Text fw={500}>Current Space Complexity:</Text>
                                    <Badge color="blue" variant="light" size="lg">{summary.currentSpaceComplexity}</Badge>
                                </Box>
                                <Box>
                                    <Text fw={500}>Best Possible Space Complexity:</Text>
                                    <Badge color="green" variant="light" size="lg">{summary.bestSpaceComplexity}</Badge>
                                </Box>
                                <Box>
                                    <Text fw={500}>Is this the best solution for interviews?</Text>
                                    <Badge color={summary.bestSolution ? "teal" : "orange"} variant="filled" size="lg">
                                        {summary.bestSolution === undefined ? 'N/A' : summary.bestSolution ? 'Yes' : 'No'}
                                    </Badge>
                                </Box>
                            </SimpleGrid>
                        </Paper>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="correctnessAndLogic">
                    <Accordion.Control><Title order={5}>Correctness & Logic</Title></Accordion.Control>
                    <Accordion.Panel><MarkdownRenderer content={correctnessAndLogic} /></Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="timeComplexityAnalysis">
                    <Accordion.Control><Title order={5}>Time Complexity Analysis</Title></Accordion.Control>
                    <Accordion.Panel><MarkdownRenderer content={timeComplexityAnalysis} /></Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="spaceComplexityAnalysis">
                    <Accordion.Control><Title order={5}>Space Complexity Analysis</Title></Accordion.Control>
                    <Accordion.Panel><MarkdownRenderer content={spaceComplexityAnalysis} /></Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="codeStyleAndReadability">
                    <Accordion.Control><Title order={5}>Code Style & Readability</Title></Accordion.Control>
                    <Accordion.Panel><MarkdownRenderer content={codeStyleAndReadability} /></Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="alternativeApproaches">
                    <Accordion.Control><Title order={5}>Alternative Approaches</Title></Accordion.Control>
                    <Accordion.Panel><MarkdownRenderer content={alternativeApproaches} /></Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Modal>
    );
}

export default AnalysisModal