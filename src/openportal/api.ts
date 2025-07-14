
import { ENV } from '@waldur/core/config';
import { getToken } from '@waldur/auth/TokenStorage';


const fixURL = (endpoint: string) =>
    endpoint.startsWith('http')
        ? endpoint
        : `${ENV.apiEndpoint}${endpoint.startsWith('/api') ? '' : 'api'}${endpoint}`;


export async function post(endpoint: string, data?: object) {
    const response = await fetch(fixURL(endpoint), {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${getToken()}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized access.)');
        }
        else {
            throw new Error(`Failed call: ${response.text()}`);
        }
    }
}
