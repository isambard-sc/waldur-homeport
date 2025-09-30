
export const ManagedProject = {
    identifier: null,
    local_identifier: null,
    state: null,
    created: null,
    reviewed_at: null,
    reviewed_by_full_name: null,
    reviewed_by_uuid: null,
    review_comment: null,
    project: null,
    project_template: null,
    destination: null,
    details: {
        name: null,
        class: null,
        credit: null,
        members: null,
        description: null,
        start_date: null,
        end_date: null,
    },
};

export const ProjectTemplate = {
    uuid: null,
    name: null,
    offering: null,
    provider: null,
    portal: null,
    customer: null,
    shortname: null,
    offerings: null,
    approval_limit: null,
    max_credit_limit: null,
    role_mapping: null,
};
