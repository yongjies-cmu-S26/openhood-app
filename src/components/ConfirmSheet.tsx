import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface Props {
  open: boolean;
  title: string;
  eyebrow?: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function ConfirmSheet({ open, title, eyebrow, confirmLabel, confirmDisabled, onConfirm, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      className="oh-dialog sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="oh-dialog__head">
        <div>
          {eyebrow && <div className="oh-label">{eyebrow}</div>}
          <h2 className="oh-h2" id={titleId}>
            {title}
          </h2>
        </div>
        <button type="button" className="oh-dialog__close" aria-label="Close" onClick={onClose}>
          <Icon name="x" />
        </button>
      </div>
      <div className="oh-dialog__body">{children}</div>
      <div className="oh-dialog__foot">
        <Button block disabled={confirmDisabled} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" block onClick={onClose}>
          Go back
        </Button>
      </div>
    </dialog>
  );
}
