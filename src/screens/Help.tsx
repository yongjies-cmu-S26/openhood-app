import { Link, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { useToast } from '../components/Toast';
import { GLOSSARY, getTerm } from '../data/glossary';
import { useVisit } from '../state/VisitContext';
import NotFound from './NotFound';

export default function Help() {
  const { term } = useParams();
  const { dispatch, storageOk } = useVisit();
  const toast = useToast();

  if (term !== undefined) {
    const entry = getTerm(term);
    if (!entry) return <NotFound />;
    return (
      <>
        <BackLink to="/help" label="All help topics" />
        <div className="page-head">
          <div className="oh-label">Help</div>
          <h1 className="oh-h1">{entry.title}</h1>
        </div>
        <section className="oh-panel stack">
          <p className="oh-body">{entry.body}</p>
          <h2 className="oh-h3">Why it matters</h2>
          <p className="oh-body">{entry.why}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1 className="oh-h1">Help</h1>
        <p className="oh-small">Plain-language answers about your car and this visit.</p>
      </div>
      <nav className="oh-list" aria-label="Help topics">
        {GLOSSARY.map((t) => (
          <Link key={t.id} className="oh-list__row" to={`/help/${t.id}`}>
            <Icon name="help" />
            <span>
              <span className="oh-list__title">{t.title}</span>
              <span className="oh-list__sub">{t.why}</span>
            </span>
            <Icon name="chevron-right" size={16} />
          </Link>
        ))}
      </nav>
      <h2 className="oh-h3 section-title">About this demo</h2>
      {!storageOk && (
        <Notice tone="warn" title="Decisions aren’t saved on this device">
          Your browser blocks storage, so choices reset when you close the page.
        </Notice>
      )}
      <p className="oh-small">This is a sample visit. No work is authorized and no messages are sent.</p>
      <Button
        variant="secondary"
        block
        onClick={() => {
          dispatch({ type: 'reset', at: Date.now() });
          toast('Demo reset');
        }}
      >
        Reset demo
      </Button>
    </>
  );
}
