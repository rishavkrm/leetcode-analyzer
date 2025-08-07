// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth } from "../firebase-config";
import type { RevisionProblem } from '../types/types';
// const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = 'https://leetcode-project-backend-1082156221911.europe-west1.run.app'

export async function fetchRevisions() {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL + '/api/revisions', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',

        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch revisions: ${response.status}`);
    }

    return await response.json();
}

export async function fetchDueRevisions() {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL + '/api/revisions/due', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',

        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch due revisions: ${response.status}`);
    }

    return await response.json();
}

export async function addRevisionProblem(problems: RevisionProblem[]) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL + '/api/revisions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(problems)
    });

    if (!response.ok) {
        throw new Error(`Failed to add revision problem: ${response.status}`);
    }

    return await response.json();
}

export async function updateRevisionProblem(problem: RevisionProblem) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL + '/api/revisions', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(problem)
    });

    if (!response.ok) {
        throw new Error(`Failed to update revision problem: ${response.status}`);
    }

    return await response.json();
}

export async function deleteRevisionProblem(problem: RevisionProblem) {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(API_BASE_URL + '/api/revisions', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(problem)
    });

    if (!response.ok) {
        throw new Error(`Failed to delete revision problem: ${response.status}`);
    }

    return await response.json();
}