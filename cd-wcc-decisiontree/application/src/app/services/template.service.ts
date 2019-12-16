import templates from '../data/templates.json';

export class TemplateService {
    public static getTree(id: number): any {
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
            });
        decision.hasChildren = !!decision.children.length;
    }
}
