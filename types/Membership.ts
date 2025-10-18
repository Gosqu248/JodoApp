export interface Membership {
    id: string;
    expiryDate: string;
    remainingEntries: number;
    isFrozen: boolean;
    frozenStart: string;
    isActive: boolean;
}
