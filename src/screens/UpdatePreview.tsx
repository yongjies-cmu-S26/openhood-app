import { useParams, useSearchParams } from 'react-router-dom';
import { AdvisorFindings } from '../components/AdvisorFindings';
import { BackLink } from '../components/BackLink';
import { Notice } from '../components/Notice';
import { OpenHoodLogo } from '../components/OpenHoodLogo';
import { getAdvisorVisit } from '../data/advisorVisits';
import { formatMoney } from '../data/money';

export default function UpdatePreview() {
  const visit = getAdvisorVisit(useParams().visitId);
  const [params] = useSearchParams();
  const estimate = params.get('view') === 'estimate';

  return (
    <div className="app oh-app">
      <header className="app-top oh-topbar">
        <OpenHoodLogo />
        {visit && <span className="oh-topbar__end"><span className="oh-tag oh-tag--navy">{visit.id}</span></span>}
      </header>
      <main className="app-main">
        <BackLink to={visit ? '/advisor/' + visit.id : '/advisor'} label="Advisor workspace" />
        {!visit ? <Notice title="Visit not found" /> : (
          <>
            <div className="page-head">
              <div className="oh-label">Customer message preview</div>
              <h1 className="oh-h1">{estimate ? 'Repair estimate' : 'Inspection findings'}</h1>
              <p className="oh-small">{visit.customer} · {visit.vehicle} · {visit.bay}</p>
            </div>
            <section className="oh-panel stack" aria-label={estimate ? 'Estimate items' : 'Findings'}>
              <AdvisorFindings findings={visit.findings} showNotes={!estimate} />
              {estimate && (
                <div className="oh-total">
                  <span className="oh-h3">Estimate total</span>
                  <span className="oh-price">{formatMoney(visit.findings.reduce((sum, finding) => sum + finding.cost, 0))}</span>
                </div>
              )}
            </section>
            <p className="oh-caption">Sample visit · Demo data</p>
          </>
        )}
      </main>
    </div>
  );
}
