import type { AwardDetails } from '../bindings/AwardDetails';

export const embargoedUntil = (row: any): string | null => {
    const earliest = (row.details as AwardDetails).earliest_approve;
    if (earliest && new Date(earliest) > new Date()) {
        return earliest;
    }
    return null;
};

export const isEmbargoed = (row: any): boolean => embargoedUntil(row) !== null;
