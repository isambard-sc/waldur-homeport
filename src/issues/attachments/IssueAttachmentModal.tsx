import { X } from '@phosphor-icons/react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { closeModalDialog } from '@waldur/modal/actions';

import './IssueAttachmentModal.scss';

interface PureIssueAttachmentModalProps {
  closeModal(): void;
  resolve: {
    url: string;
    name: string;
  };
}

export class PureIssueAttachmentModal extends Component<PureIssueAttachmentModalProps> {
  state = {
    loading: true,
  };

  render() {
    const {
      closeModal,
      resolve: { url, name },
    } = this.props;

    return (
      <div className="attachment-modal">
        <button
          className="attachment-modal__close text-btn"
          onClick={closeModal}
        >
          <X />
        </button>
        <div className="modal-header">
          <div className="modal-title">
            <h3>
              <a href={url} download="true">
                {name}
              </a>
            </h3>
          </div>
        </div>
        <div className="modal-body attachment-modal__img">
          {this.state.loading ? <LoadingSpinner /> : null}
          <img
            className={this.state.loading ? 'hidden' : null}
            src={url}
            alt="attachment"
            onLoad={() => this.setState({ loading: false })}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  closeModal: (): void => dispatch(closeModalDialog()),
});

export const IssueAttachmentModal = connect(
  null,
  mapDispatchToProps,
)(PureIssueAttachmentModal);
