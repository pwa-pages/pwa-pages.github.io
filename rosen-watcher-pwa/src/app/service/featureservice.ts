import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FeatureService {

    public hasPermitScreen(): boolean {
        return false;
    }

    public useUrlSetting(): boolean {
        return false;
    }
}

