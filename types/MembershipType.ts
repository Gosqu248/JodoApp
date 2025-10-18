export interface MembershipType {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    durationWeeks: number;
    entryCount: number;
    withExercises: boolean;
    isLimited: boolean;
    isActive: boolean;
}
