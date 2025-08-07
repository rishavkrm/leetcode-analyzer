// const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = 'https://leetcode-project-backend-1082156221911.europe-west1.run.app'

export default async function RegisterLogin(idToken: string) {
    try {
        const response = await fetch(API_BASE_URL + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken: idToken
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Authentication failed');
        }
        return response
    } catch (err) {
        console.error(err)
    }

}
