
import { ENV } from '@waldur/core/config';
import { AuthTokenStorage } from '@waldur/core/StorageManager';
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
            Authorization: `Token ${AuthTokenStorage.get()}`,
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

    return response;
}


export async function put(endpoint: string, data?: object) {
    const response = await fetch(fixURL(endpoint), {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${AuthTokenStorage.get()}`,
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

    return response;
}


export async function patch(endpoint: string, data?: object) {
    const response = await fetch(fixURL(endpoint), {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${AuthTokenStorage.get()}`,
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

    return response;
}

export const deleteManagedProject = async (path: {
    identifier: string,
    destination: string,
}) => {
    client.delete({
        url: `/api/openportal-managed-projects/${path.identifier}/${path.destination}/`,
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

export const attachProjectToManagedProject = async (managed_project, project) => {
    const response = await post(`/openportal-managed-projects/${managed_project.identifier}/${managed_project.destination}/attach/`, { project_uuid: project.uuid });
    return response.json();
};

export const detachProjectFromManagedProject = async (managed_project) => {
    const response = await post(`/openportal-managed-projects/${managed_project.identifier}/${managed_project.destination}/detach/`, {});
    return response.json();
};
