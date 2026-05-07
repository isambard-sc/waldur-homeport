
import { ENV } from '@waldur/core/config';
import { AuthTokenStorage } from '@waldur/core/StorageManager';
import { client } from 'waldur-js-client/client.gen';
import { openportalManagedProjectsList } from 'waldur-js-client';


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

/**
 * Returns true if the given project is attached to a ManagedProject.
 *
 * By default also returns true when the ManagedProject is in `pending` or
 * `rejected` state, because update requests (e.g. allocation increases)
 * cycle through those states without changing the fact that the project is
 * being remotely managed. Only a `canceled` ManagedProject means the
 * project is no longer managed.
 */
export const isProjectManaged = async (
    project: { uuid: string },
    { include_pending = true, include_rejected = true }: {
        include_pending?: boolean;
        include_rejected?: boolean;
    } = {},
): Promise<boolean> => {
    const state: Array<'approved' | 'pending' | 'rejected'> = ['approved'];
    if (include_pending) state.push('pending');
    if (include_rejected) state.push('rejected');

    const { data } = await openportalManagedProjectsList({
        query: { project_uuid: project.uuid, state, page_size: 1 },
    });

    return Array.isArray(data) && data.length > 0;
};
