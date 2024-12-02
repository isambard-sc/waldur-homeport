import { Field } from 'react-final-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { validateProjectShortName } from '../validators';

export const ProjectShortNameGroup = ({ customer }) => (
    <FormGroup label={translate('Project short name')} required controlId="short_name">
        <Field
            component={StringField as any}
            name="short_name"
            placeholder={translate('e.g. my-project')}
            description={translate(
                'This name will be used in UNIX accounts and similar. It cannot be changed later. It can only contain lower-case letters, numbers, hyphens and underscores.'
            )}
            validate={validateProjectShortName}
            customer={customer}
        />
    </FormGroup>
);
