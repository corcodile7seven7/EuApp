export default function Timer({ seconds, pct }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const color = pct > 0.25 ? 'text-eu-blue dark:text-eu-yellow' : pct > 0.1 ? 'text-warn-orange' : 'text-fail-red';
  const barColor = pct > 0.25 ? 'bg-eu-blue' : pct > 0.1 ? 'bg-warn-orange' : 'bg-fail-red';

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className={`text-sm font-mono font-bold ${color}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
