// 1. Type Definitions
interface Submission {
    id: number;
    lang: string;
    lang_name: string;
    timestamp: number;
    status_display: string;
    runtime: string;
    url: string;
    isPending: string;
    title: string;
    memory: string;
    code: string;
    isBestSolution: boolean;
    currentTimeComplexity: string;
    currentSpaceComplexity: string;
    bestTimeComplexity: string;
    bestSpaceComplexity: string;
}

interface AppNotification {
    id: number;
    title: string;
    message: string;
    color: string;
}

interface AnalysisReport {
    correctnessAndLogic: string;
    timeComplexityAnalysis: string;
    spaceComplexityAnalysis: string;
    codeStyleAndReadability: string;
    alternativeApproaches: string;
    summary: AnalysisSummary;
}
interface AnalysisSummary {
    bestSolution?: boolean;
    bestTimeComplexity: string;
    currentTimeComplexity: string;
    bestSpaceComplexity: string;
    currentSpaceComplexity: string;
}

interface ComparisonData {
    optimalCode: string;
    diffView: string;
    insights: {
        algorithmic: string;
        complexity: string;
        patterns: string;
    };
    steps: {
        title: string;
        description: string;
        code?: string;
    }[];
}
interface PatternInfo {
    name: string;
    description: string;
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    whyPriority: string;
    keyPoints: string[];
    questions: {
        id: string;
        title: string;
        difficulty: string;
        url: string;
    }[];
    commonMistakes: string[];
    template: string;
}

interface OverallAnalysis {
    strengths: string[];
    weaknesses: string[];
    learningRecommendations: string[];
    commonMistakesSummary: string | null;
}
interface RevisionProblem extends Submission {
    notes: string;
    last_revised: string;
    next_revision: string;
    difficulty: string;
    confidence_level: number;
    revision_count: number;
    tags: string[];
}

interface RevisionList {
    userId: string;
    revisions: RevisionProblem[];
}

export type {
    Submission,
    AppNotification,
    AnalysisReport,
    AnalysisSummary,
    ComparisonData,
    PatternInfo,
    OverallAnalysis,
    RevisionProblem,
    RevisionList
}