import { Injectable } from '@angular/core';

export const TEMPLATES = 'templatesConfig'

@Injectable()
export class LocalstorageService {
    public get templates(): any {
        const jsObj = JSON.parse(localStorage.getItem(TEMPLATES));
        return jsObj;
    }

    public set templates(templates: any) {
        if (templates) {
            const stringfy = JSON.stringify(templates);
            localStorage.setItem(TEMPLATES, stringfy);
        } else {
            localStorage.removeItem(TEMPLATES);
        }
    }
}
