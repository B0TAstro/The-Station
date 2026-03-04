'use client';

interface PeriodSelectorProps {
    period: 'month' | 'quarter' | 'year';
    date: string; // ISO date string like "2026-03"
    onChange: (period: 'month' | 'quarter' | 'year', date: string) => void;
}

const PERIOD_LABELS: Record<string, string> = {
    month: 'Mois',
    quarter: 'Trimestre',
    year: 'Année',
};

function getMonthOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
}

function getQuarterOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3);
    for (let i = 0; i < 8; i++) {
        const q = currentQ - i;
        const year = now.getFullYear() + Math.floor(q / 4);
        const quarter = ((q % 4) + 4) % 4;
        const month = quarter * 3 + 1;
        const value = `${year}-${String(month).padStart(2, '0')}`;
        const label = `T${quarter + 1} ${year}`;
        options.push({ value, label });
    }
    return options;
}

function getYearOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i;
        options.push({ value: `${year}-01`, label: `${year}` });
    }
    return options;
}

export function PeriodSelector({ period, date, onChange }: PeriodSelectorProps) {
    const dateOptions =
        period === 'month' ? getMonthOptions() : period === 'quarter' ? getQuarterOptions() : getYearOptions();

    return (
        <div className="flex items-center gap-2">
            <select
                value={period}
                onChange={(e) => {
                    const newPeriod = e.target.value as 'month' | 'quarter' | 'year';
                    const newOptions =
                        newPeriod === 'month'
                            ? getMonthOptions()
                            : newPeriod === 'quarter'
                              ? getQuarterOptions()
                              : getYearOptions();
                    onChange(newPeriod, newOptions[0]?.value || date);
                }}
                className="px-3 py-1.5 bg-muted text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-budget"
            >
                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
            <select
                value={date}
                onChange={(e) => onChange(period, e.target.value)}
                className="px-3 py-1.5 bg-muted text-foreground border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-budget"
            >
                {dateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
