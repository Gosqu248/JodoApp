export interface DurationFormattable {
    type?: string;
    durationMonths?: number;
    durationWeeks?: number;
}

/**
 * Formats membership duration based on months and weeks
 * @param item - Object containing duration information
 * @returns Formatted duration string
 */
export const formatDuration = (item: DurationFormattable): string => {
    const durationMonths = item.durationMonths || 0;
    const durationWeeks = item.durationWeeks || 0;

    const months = durationMonths > 0 ? `${durationMonths} mies.` : '';
    const weeks = durationWeeks > 1 ? `${durationWeeks} tyg.` : durationWeeks === 1 ? `${durationWeeks} tyd.` : '';

    if (months && weeks) {
        return `${months} i ${weeks}`;
    } else if (months || weeks)  {
        return `${months}${weeks}`;
    }

    if (item.type) {
        return 'Karnet ' + item.type;
    }

    return '';
};

/**
 * Formats activity duration from minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "1h 30min" or "45min")
 */
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


/**
 * Formats price with proper locale formatting
 * @param price - Price value to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
    return price.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * Formats phone number with spacing for better readability
 * @param number - Phone number string to format
 * @returns Formatted phone number or "No number" if null
 */
export const formatPhoneNumber = (number: string | null) => {
    if (!number) return 'Brak numeru';

    const cleaned = number.replace(/\D/g, '');

    const chunks = [];
    for (let i = 0; i < cleaned.length; i += 3) {
        chunks.push(cleaned.slice(i, i + 3));
    }

    return chunks.join(' ');
}

/**
 * Formats date to localized date string
 * @param date - Date object to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date) =>
    date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

/**
 * Formats time string to ensure two-digit hours and minutes
 * @param timeString
 */
export const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};