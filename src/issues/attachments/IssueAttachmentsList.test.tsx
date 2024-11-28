import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

describe('IssueAttachmentsList', () => {
  it('renders nothing when no attachments and no uploads', () => {
    const { container } = render(
      <IssueAttachmentsList attachments={[]} uploading={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders list of attachments', () => {
    render(
      <IssueAttachmentsList
        attachments={mockAttachments as any}
        uploading={0}
      />,
    );
    expect(screen.getAllByTestId('mocked-attachment')).toHaveLength(2);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.jpg')).toBeInTheDocument();
  });

  it('renders loading spinners for uploading files', () => {
    render(<IssueAttachmentsList attachments={[]} uploading={2} />);
    expect(screen.getAllByTestId('spinner')).toHaveLength(2);
  });

  it('renders both attachments and uploading files', () => {
    render(
      <IssueAttachmentsList
        attachments={mockAttachments as any}
        uploading={1}
      />,
    );
    expect(screen.getAllByTestId('mocked-attachment')).toHaveLength(2);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
