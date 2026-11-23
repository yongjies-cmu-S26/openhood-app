import { useState } from 'react';
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
import type { Decision, Decisions } from '../data/types';
import { VISIT } from '../data/visit';
import { findingTotal } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import NotFound from './NotFound';

export default function ReviewItem() {
  const finding = getFinding(useParams().id);
  const { state, dispatch } = useVisit();
  const navigate = useNavigate();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  if (!finding) return <NotFound />;

  const total = findingTotal(finding);
  const decision = state.decisions[finding.id];

  function decide(next: Decision) {
    dispatch({ type: 'decide', id: finding!.id, decision: next });
    toast(next === 'approved' ? `${finding!.title} approved · ${formatWhole(total)}` : `${finding!.title} declined`);
    setSheetOpen(false);
    const after: Decisions = { ...state.decisions, [finding!.id]: next };
    const nextItem = FINDINGS.find((f) => after[f.id] === undefined);
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
        <p className="oh-small">Approving authorizes the work. You pay at pickup.</p>
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
      {decision ? (
        <>
          <Notice title={`You ${decision} this repair.`}>You can change your decision until work starts.</Notice>
          <Button variant="secondary" block onClick={() => dispatch({ type: 'decide', id: finding.id, decision: null })}>
            Change decision
          </Button>
        </>
      ) : (
        <>
          <Button block onClick={() => setSheetOpen(true)}>
            Approve repair · {formatWhole(total)}
          </Button>
          <Button variant="secondary" block onClick={() => decide('declined')}>
            Decline this repair
          </Button>
        </>
      )}
      <p className="oh-caption">Sample estimate · No work is authorized in this demo</p>
      <ConfirmSheet
        open={sheetOpen}
        title={`Approve ${finding.title.toLowerCase()}?`}
        eyebrow={`${VISIT.ro} · Item ${finding.number} of ${FINDINGS.length}`}
        confirmLabel={`Approve · ${formatWhole(total)}`}
        onConfirm={() => decide('approved')}
        onClose={() => setSheetOpen(false)}
      >
        <p className="oh-small" style={{ color: 'var(--oh-ink)' }}>
          {VISIT.technician.name} starts in {VISIT.bay} right away. You pay at pickup.
        </p>
        <CostLines lines={finding.costLines} />
      </ConfirmSheet>
    </>
  );
}
