export enum WeightCategory {
    UP_TO_47 = 'UP_TO_47',      // Do 47 kg
    UP_TO_52 = 'UP_TO_52',      // 47.01 - 52 kg
    UP_TO_59 = 'UP_TO_59',      // 52.01 - 59 kg
    UP_TO_66 = 'UP_TO_66',      // 59.01 - 66 kg
    UP_TO_74 = 'UP_TO_74',      // 66.01 - 74 kg
    UP_TO_83 = 'UP_TO_83',      // 74.01 - 83 kg
    UP_TO_93 = 'UP_TO_93',      // 83.01 - 93 kg
    UP_TO_105 = 'UP_TO_105',    // 93.01 - 105 kg
    UP_TO_120 = 'UP_TO_120',    // 105.01 - 120 kg
    OVER_120 = 'OVER_120'       // Powyżej 120 kg
}

/**
 * Helper functions for WeightCategory
 */
export class WeightCategoryHelper {
    /**
     * Get display label for weight category
     */
    static getLabel(category: WeightCategory): string {
        const labels: Record<WeightCategory, string> = {
            [WeightCategory.UP_TO_47]: 'Do 47 kg',
            [WeightCategory.UP_TO_52]: 'Do 52 kg',
            [WeightCategory.UP_TO_59]: 'Do 59 kg',
            [WeightCategory.UP_TO_66]: 'Do 66 kg',
            [WeightCategory.UP_TO_74]: 'Do 74 kg',
            [WeightCategory.UP_TO_83]: 'Do 83 kg',
            [WeightCategory.UP_TO_93]: 'Do 93 kg',
            [WeightCategory.UP_TO_105]: 'Do 105 kg',
            [WeightCategory.UP_TO_120]: 'Do 120 kg',
            [WeightCategory.OVER_120]: 'Powyżej 120 kg'
        };
        return labels[category];
    }

    /**
     * Get all weight categories
     */
    static getAllCategories(): WeightCategory[] {
        return [
            WeightCategory.UP_TO_47,
            WeightCategory.UP_TO_52,
            WeightCategory.UP_TO_59,
            WeightCategory.UP_TO_66,
            WeightCategory.UP_TO_74,
            WeightCategory.UP_TO_83,
            WeightCategory.UP_TO_93,
            WeightCategory.UP_TO_105,
            WeightCategory.UP_TO_120,
            WeightCategory.OVER_120
        ];
    }
}
