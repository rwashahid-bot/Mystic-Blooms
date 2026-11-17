import Modal from '../Modal/Modal';
import './ConfirmDialog.css';

/** Confirmation prompt for destructive actions. */
const ConfirmDialog = ({ open, title = 'Are you sure?', message, confirmText = 'Delete', danger = true, loading, onConfirm, onCancel }) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <button className="btn btn-light btn-sm" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait...' : confirmText}
        </button>
      </>
    }
  >
    <p className="confirm-dialog__message">{message}</p>
  </Modal>
);

export default ConfirmDialog;
