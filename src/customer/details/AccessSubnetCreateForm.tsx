import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createAccessSubnet } from './api';

export const AccessSubnetCreateForm = ({ refetch, customer_url }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    inet: '',
    description: '',
    customer: customer_url,
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAccessSubnet(formData);
      dispatch(showSuccess(translate('Access subnet has been created.')));
      refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to create access subnet.')),
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Create access subnet')}
        closeButton
        footer={
          <Button type="submit" variant="primary" size="sm">
            {translate('Create')}
          </Button>
        }
      >
        <Form.Group>
          <Form.Label>{translate('CIDR')}</Form.Label>
          <Form.Control
            type="text"
            name="inet"
            value={formData.inet}
            onChange={handleInputChange}
            placeholder={translate('Example: 192.168.1.0/24')}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>{translate('Description')}</Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </Form.Group>
      </ModalDialog>
    </Form>
  );
};
