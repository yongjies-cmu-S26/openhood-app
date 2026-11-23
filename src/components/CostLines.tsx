import { formatMoney, sumLines } from '../data/money';
import type { CostLine } from '../data/types';

export function CostLines({ lines, totalLabel = 'Total' }: { lines: CostLine[]; totalLabel?: string }) {
  return (
    <div className="stack">
      <div className="oh-lines">
        {lines.map((line) => (
          <div key={line.label}>
            <span>{line.label}</span>
            <span>{formatMoney(line.amount)}</span>
          </div>
        ))}
      </div>
      <div className="oh-total">
        <span className="oh-h3">{totalLabel}</span>
        <span className="oh-price" data-testid="cost-total">
          {formatMoney(sumLines(lines))}
        </span>
      </div>
    </div>
  );
}
