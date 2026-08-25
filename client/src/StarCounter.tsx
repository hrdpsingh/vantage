import { useState } from 'react';

type RepositoryStarsResponse = {
    owner: string;
    repository: string;
    stargazers_count: number;
};

export function StarCounter() {
    const [owner, setOwner] = useState('');
    const [repository, setRepository] = useState('');
    const [stars, setStars] = useState<number | null>(null);
    const [error, setError] = useState('');

    async function fetchStars() {
        setError('');
        setStars(null);

        try {
            const url =
                `http://127.0.0.1:8000/repository/` +
                `${encodeURIComponent(owner)}/` +
                `${encodeURIComponent(repository)}/stars`;

            console.log('Fetching:', url);

            const response = await fetch(url);

            console.log('Status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: RepositoryStarsResponse = await response.json();

            console.log('Response:', data);

            setStars(data.stargazers_count);
        } catch (err) {
            console.error('Fetch failed:', err);

            setError(
                err instanceof Error ? err.message : 'Could not fetch repository stars.'
            );
        }
    }

    return (
        <main>
            <h1>GitHub Star Counter</h1>

            <input
                placeholder="Owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
            />

            <input
                placeholder="Repository"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
            />

            <button onClick={fetchStars} disabled={!owner || !repository}>
                Fetch Stars
            </button>

            {stars !== null && <p>Stars: {stars}</p>}

            {error && <p role="alert">{error}</p>}
        </main>
    );
}