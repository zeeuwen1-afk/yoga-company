/** Voortgangsbalk met een leesbare tekst ernaast (BOUWPROMPT §11). */
export function Voortgangsbalk({
  afgerond,
  totaal,
  label,
}: {
  afgerond: number;
  totaal: number;
  label?: string;
}) {
  const percentage = totaal === 0 ? 0 : Math.round((afgerond / totaal) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted">
          {label ?? `${afgerond} van ${totaal} onderdelen afgerond`}
        </span>
        <span className="text-sm font-semibold text-green-dark">
          {percentage}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Voortgang: ${percentage} procent`}
        className="mt-2 h-2 overflow-hidden rounded-full bg-sand"
      >
        <div
          className="h-full rounded-full bg-green transition-[width] duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
