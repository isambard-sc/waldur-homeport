
import { ENV } from '@waldur/core/config';
import { getToken } from '@waldur/auth/TokenStorage';
import { client } from 'waldur-js-client/client.gen';


export const fixURL = (endpoint: string) =>
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


export async function put(endpoint: string, data?: object) {
    const response = await fetch(fixURL(endpoint), {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${getToken()}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized access.');
        }
        else {
            throw new Error(`Failed call: ${response.text()}`);
        }
    }
}


export async function patch(endpoint: string, data?: object) {
    const response = await fetch(fixURL(endpoint), {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${getToken()}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Unauthorized access.');
        }
        else {
            throw new Error(`Failed call: ${response.text()}`);
        }
    }
}

export const deleteManagedProject = async (path: {
    identifier: string;
}) => {
    client.delete({
        url: `/api/openportal-managed-projects/${path.identifier}/`,
        path,
        security: [
            {
                name: 'Authorization',
                type: 'apiKey',
            },
        ],
    });
}

export const deleteProjectTemplate = async (path: {
    uuid: string;
}) => {
    client.delete({
        url: `/api/openportal-project-template/${path.uuid}/`,
        path,
        security: [
            {
                name: 'Authorization',
                type: 'apiKey',
            },
        ],
    });
}
