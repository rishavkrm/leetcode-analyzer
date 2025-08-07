import type { Submission, AnalysisReport, ComparisonData, PatternInfo, OverallAnalysis } from "../types/types";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth } from "../firebase-config";
// const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = 'https://leetcode-project-backend-1082156221911.europe-west1.run.app'
async function fetchFeedback(submission: Pick<Submission, 'id' | 'code' | 'lang' | 'title'>): Promise<{ data: AnalysisReport }> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('User is not authenticated. Please log in to continue.');
    }
    const response = await fetch(`${API_BASE_URL}/api/submission-feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            candidate_code: submission.code,
            lang: submission.lang,
            problem_statement: submission.title,
            problem_id: submission.id
        }),
    });
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid or expired LeetCode cookie. Analysis failed.');
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch analysis. Unknown error.' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    return response.json();
}
async function fetchSubmissions(cookie: string, submissionLimit: number,): Promise<{ data: Submission[] }> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('User is not authenticated. Please log in to continue.');
    }
    const response = await fetch(`${API_BASE_URL}/api/get-submissions?limit=${submissionLimit}`, {
        headers: {
            'X-LeetCode-Cookie': cookie,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',

        },
        credentials: 'include',
    });
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error('Invalid or expired LeetCode cookie. Please provide a valid cookie.');
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch submissions. Unknown error.' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    return response.json();
}
// Simulated API call
async function fetchComparisonData(submission: Submission): Promise<{ data: ComparisonData }> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('User is not authenticated. Please log in to continue.');
    }
    const response = await fetch(`${API_BASE_URL}/api/analyze-submission`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,

        },
        body: JSON.stringify({
            candidate_code: submission.code,
            lang: submission.lang,
            problem_statement: submission.title,
            problem_id: submission.id
        }),
    });
    return await response.json();
}

async function fetchPatternInfo(pattern: string, language: string): Promise<{ data: PatternInfo; }> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('User is not authenticated. Please log in to continue.');
    }
    const response = await fetch(`${API_BASE_URL}/api/pattern-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,

        },
        body: JSON.stringify({
            pattern: pattern,
            language: language,
        }),
    })
    return await response.json().catch(() => {
        throw new Error('Failed to fetch pattern information');
    })
}

const fetchOverAllAnalysis = async (cookie: string): Promise<{ data: OverallAnalysis }> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('User is not authenticated. Please log in to continue.');
    }
    const response = await fetch(`${API_BASE_URL}/api/overall-analysis`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-LeetCode-Cookie': cookie,
            'Authorization': `Bearer ${token}`,

        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch overall analysis');
    }
    return response.json();
}


export {
    fetchFeedback,
    fetchSubmissions,
    fetchComparisonData,
    fetchPatternInfo,
    fetchOverAllAnalysis,
}