import { Notice } from '../components/Notice';
import { Button } from '../components/Button';

export default function NotFound() {
  return (
    <>
      <Notice tone="error" title="We couldn’t find that page">
        The link may be out of date. Your visit details are safe.
      </Notice>
      <Button variant="secondary" to="/" block>
        Back to My car
      </Button>
    </>
  );
}
