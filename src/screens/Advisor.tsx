import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdvisorFindings } from '../components/AdvisorFindings';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { OpenHoodLogo } from '../components/OpenHoodLogo';
import { StatusChip } from '../components/StatusChip';
import { useToast } from '../components/Toast';
import { ADVISOR_VISITS, getAdvisorVisit, inspectionUpdateLinks, STATUS_LABELS, VISIT_STATUSES, type AdvisorVisit } from '../data/advisorVisits';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { VISIT } from '../data/visit';
import { useVisit } from '../state/VisitContext';
import type { AdvisorNotification, VisitProgress } from '../state/workflow';

function waitingTime(enteredAt: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - enteredAt) / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours ? hours + ' hr ' + (minutes % 60) + ' min' : minutes + ' min';
}

function Timestamp({ at }: { at: number }) {
  const date = new Date(at);
  return <time dateTime={date.toISOString()}>{date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>;
}

function AdvisorNotifications({ notifications, onRead }: { notifications: AdvisorNotification[]; onRead: () => void }) {
  return (
    <section className="advisor-notifications oh-panel stack" aria-label="Advisor notifications">
      <div className="advisor-heading">
        <h2 className="oh-h2">Notifications</h2>
        <Button variant="secondary" disabled={!notifications.some(({ unread }) => unread)} onClick={onRead}>
          Mark all as read
        </Button>
      </div>
      {notifications.length === 0 ? (
        <p className="oh-small">Customer decisions will appear here.</p>
      ) : (
        <ul className="advisor-notification-list">
          {notifications.map(({ id, record, unread }) => {
            const approved = FINDINGS.filter(({ id }) => record.decisions[id] === 'approved');
            const declined = FINDINGS.filter(({ id }) => record.decisions[id] === 'declined');
            return (
              <li key={id}>
                <div className="advisor-heading">
                  <Link to={'/advisor/' + VISIT.ro} className="oh-h3">{VISIT.customerName} confirmed repair decisions</Link>
                  {unread && <span className="oh-tag oh-tag--outline">Unread</span>}
                </div>
                <p className="oh-small">Approved {formatMoney(record.approvedAmount)} · <Timestamp at={record.confirmedAt} /></p>
                <p className="oh-small">Approved repairs · {approved.map(({ title }) => title).join(', ') || 'None'}</p>
                {declined.length > 0 && <p className="oh-small">Declined repairs · {declined.map(({ title }) => title).join(', ')}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function VisitCard({ visit, progress, now, primary }: { visit: AdvisorVisit; progress: VisitProgress; now: number; primary: boolean }) {
  const actionLabel = progress.status === 'needs-update' ? 'Review update' : 'View visit';

  return (
    <article className="oh-panel advisor-visit-card">
      <div className="advisor-heading">
        <h3 className="oh-h3">{visit.customer}</h3>
        <span className="oh-caption">{visit.id}</span>
      </div>
      <p className="oh-small">{visit.vehicle}</p>
      <div className="advisor-visit-meta">
        <span className="oh-tag oh-tag--outline">{visit.bay}</span>
        <span className="oh-caption"><Icon name="clock" size={14} /> Waiting {waitingTime(progress.enteredAt, now)}</span>
      </div>
      <AdvisorFindings findings={visit.findings} status={progress.status} />
      <Button
        variant={primary ? 'primary' : 'secondary'}
        to={'/advisor/' + visit.id}
        aria-label={actionLabel + ' for ' + visit.customer}
        block
      >
        {actionLabel}
      </Button>
    </article>
  );
}

function VisitDetails({ visit, progress }: { visit: AdvisorVisit; progress: VisitProgress }) {
  const { dispatch } = useVisit();
  const links = progress.update?.links ?? inspectionUpdateLinks(visit.id);
  const total = visit.findings.reduce((amount, finding) => amount + finding.cost, 0);
  const maySend = progress.status === 'needs-update';

  function sendUpdate() {
    dispatch({ type: 'send-inspection-update', id: visit.id, at: Date.now() });
  }

  return (
    <>
      <BackLink to="/advisor" label="Advisor dashboard" />
      <div className="page-head">
        <h1 className="oh-h1">{maySend ? 'Send customer update' : 'Visit details'}</h1>
        <p className="oh-small">{visit.customer} · {visit.vehicle}</p>
      </div>
      <div className="advisor-detail-grid">
        <div className="stack">
          <section className="oh-panel stack" aria-label="Customer and visit context">
            <h2 className="oh-h3">Customer and visit context</h2>
            <div className="oh-cluster">
              <span className="oh-tag oh-tag--outline">{visit.id}</span>
              <span className="oh-tag oh-tag--outline">{visit.bay}</span>
            </div>
            <p className="oh-small">Preferred channel · {visit.channel}</p>
            <StatusChip tone={progress.status === 'repair' || progress.status === 'pickup' ? 'ok' : 'info'} label={STATUS_LABELS[progress.status]} />
          </section>
          <section className="oh-panel stack" aria-label="Customer message preview">
            <h2 className="oh-h3">Inspection ready</h2>
            <p className="oh-small">Hi {visit.customer.split(' ')[0]}, your inspection is ready. Open the links to see the findings and review your estimate.</p>
            <Link to={links.inspection}>Open customer inspection</Link>
            <Link to={links.estimate}>Open customer estimate</Link>
            <p className="oh-caption">Simulated {visit.channel} · No message leaves this device</p>
            {maySend && <Button block onClick={sendUpdate}>Send update to {visit.customer.split(' ')[0]}</Button>}
          </section>
          {progress.update && (
            <Notice title={progress.update.channel + ' update delivered · Demo'}>
              <p className="oh-small">Sent at <Timestamp at={progress.update.sentAt} />.</p>
              <p className="oh-small">Approval status · {STATUS_LABELS[progress.status]}</p>
            </Notice>
          )}
        </div>
        <div className="stack">
          <section className="oh-panel stack" aria-label="Inspection summary">
            <h2 className="oh-h3">Inspection summary</h2>
            <AdvisorFindings findings={visit.findings} status={progress.status} showNotes />
            <div className="oh-total">
              <span className="oh-h3">Estimate total</span>
              <span className="oh-price">{formatMoney(total)}</span>
            </div>
          </section>
          {visit.id === VISIT.ro && (
            <section className="oh-panel stack" aria-label="Inspection evidence">
              <h2 className="oh-h3">Evidence</h2>
              <div className="advisor-evidence">
                {FINDINGS.map((finding) => (
                  <figure key={finding.id}>
                    <figcaption className="oh-label">{finding.title}</figcaption>
                    <EvidenceDiagram id={finding.id} />
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export default function Advisor() {
  const { visitId } = useParams();
  const { state, dispatch } = useVisit();
  const showToast = useToast();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [now, setNow] = useState(Date.now);
  const { visits, notifications } = state.workflow;
  const unread = notifications.filter((notification) => notification.unread).length;
  const latestUnread = notifications.find((notification) => notification.unread);
  const lastUnreadId = latestUnread?.id;
  const latestRecord = latestUnread?.record;
  const approvedTitles = latestRecord ? FINDINGS.filter(({ id }) => latestRecord.decisions[id] === 'approved').map(({ title }) => title.toLowerCase()) : [];
  const notificationText = latestRecord
    ? VISIT.customerName + (approvedTitles.length ? ' approved ' + approvedTitles.join(' and ') : ' declined all repairs') + ' · ' + formatMoney(latestRecord.approvedAmount)
    : '';
  const pendingUpdates = ADVISOR_VISITS.filter(({ id }) => visits[id].status === 'needs-update').length;
  const sortedVisits = [...ADVISOR_VISITS].sort((a, b) => visits[a.id].enteredAt - visits[b.id].enteredAt);
  const priorityVisitId = sortedVisits.find(({ id }) => visits[id].status === 'needs-update')?.id;
  const visit = getAdvisorVisit(visitId);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (notificationText) showToast(notificationText);
  }, [lastUnreadId, notificationText, showToast]);

  return (
    <div className="oh-app oh-desk advisor">
      <header className="advisor-top">
        <div className="advisor-top-inner">
          <div className="advisor-brand">
            <OpenHoodLogo to="/advisor" label="OpenHood advisor dashboard" />
            <span className="advisor-workspace oh-label">Service desk</span>
          </div>
          <nav className="advisor-top-actions" aria-label="Workspace navigation">
            <Button variant="secondary" to="/">Customer view</Button>
            <Button
              variant="secondary"
              className="advisor-bell oh-btn--icon"
              aria-label={'Notifications (' + unread + ' unread)'}
              aria-controls="advisor-notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <span className="advisor-bell-icon" aria-hidden="true" />
              {unread > 0 && <span className="advisor-bell-count" aria-hidden="true">{unread}</span>}
            </Button>
          </nav>
        </div>
      </header>
      <main className="oh-desk__main advisor-main">
        <div id="advisor-notifications" hidden={!notificationsOpen}>
          {notificationsOpen && (
            <AdvisorNotifications notifications={notifications} onRead={() => dispatch({ type: 'read-advisor-notifications' })} />
          )}
        </div>
        {visit ? (
          <VisitDetails visit={visit} progress={visits[visit.id]} />
        ) : visitId ? (
          <>
            <BackLink to="/advisor" label="Advisor dashboard" />
            <Notice title="Visit not found">Choose an active visit from the dashboard.</Notice>
          </>
        ) : (
          <>
            <div className="advisor-heading advisor-board-heading">
              <div className="page-head">
                <div className="oh-label">{VISIT.advisor} · Service advisor</div>
                <h1 className="oh-h1">Advisor dashboard</h1>
                <p className="oh-small">Keep customers informed and repairs moving.</p>
              </div>
              <div className="oh-cluster">
                <span className="oh-tag oh-tag--outline">{ADVISOR_VISITS.length} active visits</span>
                <span className="oh-tag">{pendingUpdates} {pendingUpdates === 1 ? 'update' : 'updates'} to send</span>
              </div>
            </div>
            <div className="advisor-sort oh-caption"><Icon name="clock" size={16} /> Longest waiting first</div>
            <div className="oh-board advisor-board">
              {VISIT_STATUSES.map((status) => {
                const lane = sortedVisits.filter(({ id }) => visits[id].status === status);
                return (
                  <section key={status} className={'advisor-lane advisor-lane--' + status} aria-labelledby={'lane-' + status}>
                    <div className="advisor-lane-heading">
                      <h2 className="oh-h3" id={'lane-' + status}>{STATUS_LABELS[status]}</h2>
                      <span className="oh-tag" aria-label={lane.length + ' visits'}>{lane.length}</span>
                    </div>
                    {lane.length ? lane.map((entry) => <VisitCard key={entry.id} visit={entry} progress={visits[entry.id]} now={now} primary={entry.id === priorityVisitId} />)
                      : <p className="oh-small advisor-empty">No visits in this status.</p>}
                  </section>
                );
              })}
            </div>
          </>
        )}
        <footer className="advisor-footer oh-caption">Demo data · Sample visits and estimates · No messages are sent</footer>
      </main>
    </div>
  );
}
