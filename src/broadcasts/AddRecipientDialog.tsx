import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { userAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface AddRecipientDialogProps {
  show: boolean;
  onHide: () => void;
  onAdd: (user: any) => void;
}

export const AddRecipientDialog = ({
  show,
  onHide,
  onAdd,
}: AddRecipientDialogProps) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAdd = () => {
    if (selectedUser) {
      onAdd(selectedUser);
      setSelectedUser(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{translate('Add recipient')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AsyncPaginate
          placeholder={translate('Select user...')}
          loadOptions={(query, prevOptions, { page }) =>
            userAutocomplete(query, prevOptions, page)
          }
          defaultOptions
          getOptionLabel={(option) =>
            `${option.full_name || option.username} (${option.email})`
          }
          getOptionValue={(option) => option.uuid}
          noOptionsMessage={() => translate('No users found')}
          isClearable={true}
          value={selectedUser}
          onChange={setSelectedUser}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {translate('Cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={!selectedUser}
        >
          {translate('Add')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
