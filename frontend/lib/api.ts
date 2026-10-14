const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly messages: string[],
    ) {
        super(messages.join(' · '));
    }
}

export function toMessages(error: unknown): string[] {
    if (error instanceof ApiError) return error.messages;
    return ['Une erreur inattendue est survenue.'];
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
        });
    } catch {
        throw new ApiError(0, [
            'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
        ]);
    }

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        const raw = body?.message;
        const messages = Array.isArray(raw)
            ? raw
            : raw
                ? [String(raw)]
                : [`Erreur ${response.status}`];
        throw new ApiError(response.status, messages);
    }

    if (response.status === 204) {
        return undefined as T;
    }
    return (await response.json()) as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};