import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { Icon } from '../components/Icon';
import { DecisionChip, FindingStatusChip } from '../components/StatusChip';
import { FINDINGS, getFinding } from '../data/findings';
import { getTerm } from '../data/glossary';
import { useVisit } from '../state/VisitContext';
import NotFound from './NotFound';

export default function Finding() {
  const { id } = useParams();
  const finding = getFinding(id);
  const { state, dispatch } = useVisit();

  useEffect(() => {
    if (finding) dispatch({ type: 'markSeen', id: finding.id });
  }, [finding, dispatch]);

  if (!finding) return <NotFound />;
  const term = getTerm(finding.helpTerm)!;
  const next = FINDINGS[(FINDINGS.indexOf(finding) + 1) % FINDINGS.length];
  const decision = state.decisions[finding.id];

  return (
    <>
      <BackLink to="/inspect" label="Vehicle model" />
      <div className="page-head">
        <div className="oh-label">
          Finding {finding.number} of {FINDINGS.length}
        </div>
        <h1 className="oh-h1">{finding.title}</h1>
        <div className="oh-cluster">
          <FindingStatusChip status={finding.status} />
          <span className="oh-small">{finding.location}</span>
          {decision && <DecisionChip decision={decision} />}
        </div>
      </div>
      <section className={`oh-finding${finding.status === 'soon' ? ' oh-finding--amber' : ''}`}>
        <p className="oh-body">{finding.summary}</p>
        <p className="oh-data">{finding.measurement}</p>
        <Link className="evidence-preview" to={`/findings/${finding.id}/evidence`}>
          <EvidenceDiagram id={finding.id} />
          <span>
            <Icon name="expand" size={16} /> Enlarge evidence
          </span>
        </Link>
      </section>
      <Button variant="text" to={`/help/${term.id}`}>
        What is a {term.title.split(' (')[0].toLowerCase()}?
      </Button>
      <Button variant="secondary" to={`/wait/${finding.id}`} block>
        Can this repair wait?
      </Button>
      <Button to={`/review/${finding.id}`} block>
        Review this repair
      </Button>
      <Button variant="text" to={`/findings/${next.id}`}>
        Next finding: {next.title}
      </Button>
    </>
  );
}
