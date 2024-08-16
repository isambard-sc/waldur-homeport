import { shallow } from 'enzyme';

import { ordinaryUser, staffUser } from '@waldur/user/support/fixtures';
import { TermsOfService } from '@waldur/user/support/TermsOfService';
import { UserEditForm } from '@waldur/user/support/UserEditForm';

const renderForm = (props) =>
  shallow(<UserEditForm handleSubmit={jest.fn()} {...props} />);

describe('UserEditForm', () => {
  it('should render form with all possible fields for STAFF user', () => {
    const wrapper = renderForm({
      initial: false,
      isVisibleForSupportOrStaff: true,
      userTokenIsVisible: true,
      fieldIsVisible: () => true,
      fieldIsProtected: () => false,
      isRequired: () => true,
      nativeNameIsVisible: true,
      user: staffUser,
    });
    expect(wrapper.find({ label: 'First name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Last name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Native name' }).length).toBe(1);
    expect(wrapper.find({ label: 'User status' }).length).toBe(1);
    expect(wrapper.find({ label: 'Organization name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Job position' }).length).toBe(1);
    expect(wrapper.find({ label: 'Description' }).length).toBe(1);
    expect(wrapper.find({ label: 'Phone number' }).length).toBe(1);
    expect(wrapper.find({ label: 'UNIX user name' }).length).toBe(1);
    expect(wrapper.find(TermsOfService).length).toBe(1);
  });

  it('should render form with hidden fields for STAFF user', () => {
    const wrapper = renderForm({
      initial: false,
      isVisibleForSupportOrStaff: false,
      userTokenIsVisible: false,
      fieldIsVisible: () => true,
      fieldIsProtected: () => false,
      isRequired: () => true,
      nativeNameIsVisible: false,
      user: staffUser,
    });
    expect(wrapper.find({ label: 'First name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Last name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Native name' }).length).toBe(0);
    expect(wrapper.find({ label: 'User status' }).length).toBe(0);
    expect(wrapper.find({ label: 'Organization name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Job position' }).length).toBe(1);
    expect(wrapper.find({ label: 'Description' }).length).toBe(0);
    expect(wrapper.find({ label: 'Phone number' }).length).toBe(1);
    expect(wrapper.find({ label: 'Current API token' }).length).toBe(0);
    expect(wrapper.find({ name: 'token_lifetime' }).length).toBe(0);
    expect(wrapper.find(TermsOfService)).toHaveLength(1);
  });

  it('should render initial form with appropriate fields for STAFF user', () => {
    const wrapper = renderForm({
      initial: true,
      isVisibleForSupportOrStaff: true,
      userTokenIsVisible: false,
      fieldIsVisible: () => false,
      fieldIsProtected: () => false,
      isRequired: () => true,
      nativeNameIsVisible: true,
      user: staffUser,
    });
    expect(wrapper.find({ label: 'First name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Last name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Native name' }).length).toBe(1);
    expect(wrapper.find({ label: 'Registration method' }).length).toBe(0);
    expect(wrapper.find({ label: 'User status' }).length).toBe(1);
    expect(wrapper.find({ label: 'Organization name' }).length).toBe(0);
    expect(wrapper.find({ label: 'Job position' }).length).toBe(0);
    expect(wrapper.find({ label: 'Description' }).length).toBe(1);
    expect(wrapper.find({ label: 'Phone number' }).length).toBe(0);
    expect(wrapper.find({ label: 'Current API token' }).length).toBe(0);
    expect(wrapper.find({ name: 'token_lifetime' }).length).toBe(0);
    expect(wrapper.find(TermsOfService).length).toBe(1);
    expect(wrapper.find({ label: 'Agree and proceed' }).length).toBe(1);
  });

  it('should render form with native name and civil number for ORDINARY user', () => {
    const wrapper = renderForm({
      initial: false,
      isVisibleForSupportOrStaff: true,
      userTokenIsVisible: false,
      fieldIsVisible: () => false,
      fieldIsProtected: () => false,
      isRequired: () => false,
      nativeNameIsVisible: true,
      user: ordinaryUser,
    });
    expect(wrapper.find({ label: 'Native name' }).length).toBe(1);
    expect(wrapper.find({ label: 'ID code' }).length).toBe(1);
  });
});
