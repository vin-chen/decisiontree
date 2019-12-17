import { Injectable } from '@angular/core';
import templates from '../data/templates.json';
import { LocalstorageService } from '../services/localStorage.service';

@Injectable()
export class TemplateService {
    public static templates: Array<any>;
    public static localStorageService = new LocalstorageService();

    public static getTemplates() {
        if(!TemplateService.localStorageService.templates) {
            TemplateService.localStorageService.templates = templates;
        }
        if (!TemplateService.templates) {
            TemplateService.templates = this.localStorageService.templates;
        }
        return TemplateService.templates;
    }
    
    public static getTree(id: number): Array<any> {
        const templates = TemplateService.getTemplates();
        const template = templates.find(data => data.id === id);
        const tree = [];
        if (template && template.decisions) {
            template.decisions.forEach(decision => {
                if (!decision.pid) {
                    tree.push(decision);
                    TemplateService.getChildren(template.decisions, decision);
                }
            });
        }
        return tree;
    }

    private static getChildren(decisions: Array<any>, decision: any) {
        decision.children = [];
        decisions
            .filter(dec => dec.pid === decision.id)
            .forEach(dec => {
                decision.children.push(dec);
                TemplateService.getChildren(decisions, dec);
                dec.parent = decision;
            });
        decision.hasChildren = !!decision.children.length;
    }

    public static getTemplateData(categoryId: number, templateId: number): any {
        const templates = TemplateService.getTemplates();
        const template = templates.find(data => data.id === categoryId);
        const templateItem = template.templates.find(data => data.id === templateId);
        return TemplateService.formatData(templateItem.values);
    }

    private static formatData(values: Array<any>) {
        const result = [];
        values.forEach(line => {
            let value = line.value;
            switch (line.type) {
                case 'string':
                    value = line.value + '';
                    break;
                case 'number':
                    value = parseInt(line.value);
                    break;
                case 'boolean':
                    value = !!line.value;
                    break;
            }
            result.push({
                name: line.key,
                value: value
            });
        });
        return result;
    }
}
