import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { FindingStatusChip } from '../components/StatusChip';
import { getFinding } from '../data/findings';
import NotFound from './NotFound';

export default function Evidence() {
  const finding = getFinding(useParams().id);
  if (!finding) return <NotFound />;
  return (
    <>
      <BackLink to={`/findings/${finding.id}`} label={finding.title} />
      <div className="page-head">
        <h1 className="oh-h1">Evidence · {finding.title}</h1>
        <FindingStatusChip status={finding.status} />
      </div>
      <EvidenceDiagram id={finding.id} />
      <p className="oh-data">{finding.measurement}</p>
      <p className="oh-small">{finding.whatIsWrong}</p>
      <p className="oh-caption">Annotated sample photo · illustrative</p>
    </>
  );
}
