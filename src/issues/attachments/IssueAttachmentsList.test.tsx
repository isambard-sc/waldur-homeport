import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { RootState } from '@waldur/store/reducers';

import { attachmentUploading } from './fixture';
import { IssueAttachmentsList } from './IssueAttachmentsList';

vi.mock('./IssueAttachment', () => ({
  IssueAttachment: ({ attachment }) => (
    <div data-testid="mocked-attachment">{attachment.name}</div>
  ),
}));

const mockAttachments = [
  { uuid: 'test-1', name: 'file1.pdf' },
  { uuid: 'test-2', name: 'file2.jpg' },
];

const initStore: Partial<RootState> = {
  issues: {
    comments: {
      issue: {} as any,
      items: [],
    } as any,
    attachments: {
      issue: {} as any,
      items: [],
    } as any,
  },
};

const renderWithProvider = (component) => {
  const mockStore = configureStore();
  return render(<Provider store={mockStore(initStore)}>{component}</Provider>);
};

describe('IssueAttachmentsList', () => {
  it('renders nothing when no attachments and no uploads', () => {
    const { container } = renderWithProvider(
      <IssueAttachmentsList attachments={[]} uploading={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders list of attachments', () => {
    renderWithProvider(
      <IssueAttachmentsList
        attachments={mockAttachments as any}
        uploading={[]}
      />,
    );
    expect(screen.getAllByTestId('mocked-attachment')).toHaveLength(2);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.jpg')).toBeInTheDocument();
  });

  it('renders pending attachment items for uploading files', () => {
    renderWithProvider(
      <IssueAttachmentsList attachments={[]} uploading={attachmentUploading} />,
    );
    expect(screen.getAllByTestId('pending-attachment-item')).toHaveLength(2);
  });

  it('renders both attachments and uploading files', () => {
    renderWithProvider(
      <IssueAttachmentsList
        attachments={mockAttachments as any}
        uploading={attachmentUploading.slice(1)}
      />,
    );
    expect(screen.getAllByTestId('mocked-attachment')).toHaveLength(2);
    expect(screen.getByTestId('pending-attachment-item')).toBeInTheDocument();
  });
});
