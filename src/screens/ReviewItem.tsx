import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { CostLines } from '../components/CostLines';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { Notice } from '../components/Notice';
import { FindingStatusChip } from '../components/StatusChip';
import { useToast } from '../components/Toast';
import { FINDINGS, getFinding } from '../data/findings';
import { formatWhole } from '../data/money';
import type { Decision } from '../data/types';
import { VISIT } from '../data/visit';
import { findingTotal } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import { currentConfirmation } from '../state/workflow';
import NotFound from './NotFound';

export default function ReviewItem() {
  const finding = getFinding(useParams().id);
  const { state, dispatch } = useVisit();
  const navigate = useNavigate();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), [finding?.id]);
  if (!finding) return <NotFound />;

  const total = findingTotal(finding);
  const receipt = currentConfirmation(state.workflow);
  const decision = (receipt?.decisions ?? state.decisions)[finding.id];
  const saving = saveStatus === 'saving';

  async function decide(choice: Decision) {
    if (!finding || pending.current) return;
    const request = new AbortController();
    pending.current = request;
    setSaveStatus('saving');
    const next = await dispatch({ type: 'decide', id: finding.id, decision: choice });
    pending.current = null;
    setSaveStatus(next || request.signal.aborted ? 'idle' : 'error');
    setSheetOpen(false);
    if (!next || request.signal.aborted) return;
    if (currentConfirmation(next.workflow)) {
      navigate('/done');
      return;
    }
    toast('Choice saved · ' + finding.title);
    const nextItem = FINDINGS.find((f) => next.decisions[f.id] === undefined);
    navigate(nextItem ? `/review/${nextItem.id}` : '/done');
  }

  return (
    <>
      <BackLink to="/review" label="All repairs" />
      <div className="page-head">
        <div className="oh-label">
          {VISIT.ro} · Item {finding.number} of {FINDINGS.length}
        </div>
        <h1 className="oh-h1">Review this repair</h1>
        <p className="oh-small">{receipt ? 'Your decision was sent to the service advisor.' : 'Choose for this repair, then confirm all your choices to authorize the work.'}</p>
      </div>
      <article className={`oh-finding${finding.status === 'soon' ? ' oh-finding--amber' : ''}`}>
        <h2 className="oh-h2">{finding.title}</h2>
        <FindingStatusChip status={finding.status} />
        <EvidenceDiagram id={finding.id} />
        <p className="oh-small">{finding.summary}</p>
        <Button variant="secondary" small to={`/findings/${finding.id}/evidence`}>
          Enlarge evidence
        </Button>
        <CostLines lines={finding.costLines} />
      </article>
      {saveStatus === 'error' && <Notice tone="error" title="Could not save your choice">Select your choice again to retry.</Notice>}
      {decision ? (
        <>
          <Notice title={`You ${decision} this repair.`}>{receipt ? 'This choice is part of your confirmed decisions.' : 'You can change your choice until you confirm your decisions.'}</Notice>
          {receipt
            ? <Button to="/done" block>View confirmation</Button>
            : <Button variant="secondary" block onClick={() => dispatch({ type: 'decide', id: finding.id, decision: null })}>Change decision</Button>}
        </>
      ) : (
        <>
          <Button block disabled={saving} onClick={() => setSheetOpen(true)}>
            Approve repair · {formatWhole(total)}
          </Button>
          <Button variant="secondary" block disabled={saving} onClick={() => decide('declined')}>
            Decline this repair
          </Button>
        </>
      )}
      <p className="oh-caption">Sample estimate · No work is authorized in this demo</p>
      <ConfirmSheet
        open={sheetOpen && !receipt}
        title={`Approve ${finding.title.toLowerCase()}?`}
        eyebrow={`${VISIT.ro} · Item ${finding.number} of ${FINDINGS.length}`}
        confirmLabel={`Approve · ${formatWhole(total)}`}
        confirmDisabled={saving}
        onConfirm={() => decide('approved')}
        onClose={() => setSheetOpen(false)}
      >
        <p className="oh-small" style={{ color: 'var(--oh-ink)' }}>
          {VISIT.technician.name} starts in {VISIT.bay} after you confirm all your choices. You pay at pickup.
        </p>
        <CostLines lines={finding.costLines} />
      </ConfirmSheet>
    </>
  );
}
