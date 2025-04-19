export interface RAEntry {
    nome:  string;
    RA:    string;
    PASS:  string;
    note?: string;
    token: string;
}

function generateToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let r = '';
    for (let i = 0; i < 12; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return r;
}

export async function getRAData(rawUrl: string): Promise<RAEntry[]> {
    const resp = await fetch(rawUrl, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP${resp.status}`);

    const json = await resp.text();
    const parsed: Omit<RAEntry, 'token'>[] = JSON.parse(json);

    return parsed.map((e) => ({ ...e, token: generateToken() }));
}