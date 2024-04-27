import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FeatureService {

    private permitScreen : boolean = false;
    private urlSetting : boolean = false;

    public hasPermitScreen(): boolean {
        return this.permitScreen;
    }

    public useUrlSetting(): boolean {
        return this.urlSetting;
    }

    public activateAllFeatures(){
        this.permitScreen = true;
        this.urlSetting = true;
    }
}

