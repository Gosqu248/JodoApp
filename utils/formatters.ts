export function formatActivityDuration(minutes: number): string {
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${remainingMinutes}min`;
    } else {
        return `${remainingMinutes}min`;
    }
}

export interface DurationFormattable {
    durationMonths?: number;
    durationWeeks?: number;
}

export const formatDuration = (item: DurationFormattable): string => {
    const durationMonths = item.durationMonths || 0;
    const durationWeeks = item.durationWeeks || 0;

    if (durationMonths === 0 && durationWeeks === 0) {
        return 'Karnet jednorazowy';
    }

    const months = durationMonths > 0 ? `${durationMonths} mies.` : '';
    const weeks = durationWeeks > 1 ? `${durationWeeks} tyg.` : durationWeeks === 1 ? `${durationWeeks} tyd.` : '';

    if (months && weeks) {
        return `${months} i ${weeks}`;
    } else {
        return `${months}${weeks}`;
    }
};

export const formatPrice = (price: number): string => {
    return price.toLocaleString('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};

export const formatPhoneNumber = (number: string | null) => {
    if (!number) return 'Brak numeru';

    const cleaned = number.replace(/\D/g, '');

    const chunks = [];
    for (let i = 0; i < cleaned.length; i += 3) {
        chunks.push(cleaned.slice(i, i + 3));
    }

    return chunks.join(' ');
}