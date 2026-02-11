import { Injectable } from '@nestjs/common';

@Injectable()
export class HygieneService {
    validateChecklist(checklist: any): boolean {
        if (!checklist || Object.keys(checklist).length === 0) {
            return false;
        }

        const requiredFields = ['cleanUtensils', 'properStorage', 'coveredFood'];

        for (const field of requiredFields) {
            if (checklist[field] !== true) {
                return false;
            }
        }

        return true;
    }
}
