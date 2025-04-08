import { calculateDueDate } from '../src/services/workOrder.service';

describe('calculateDueDate', () => {
    it('should return a valid future ISO date for low priority', () => {
        const result = calculateDueDate('low');
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + 10);
        expect(result.substring(0, 10)).toBe(expectedDate.toISOString().substring(0, 10));
    });

    it('should throw an error for invalid priority', () => {
        expect(() => calculateDueDate('invalid')).toThrow('Invalid priority: invalid');
    });

    it('should handle priority case-insensitively', () => {
        const result = calculateDueDate('CRITICAL');
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + 1);
        expect(result.substring(0, 10)).toBe(expectedDate.toISOString().substring(0, 10));
    });
});
