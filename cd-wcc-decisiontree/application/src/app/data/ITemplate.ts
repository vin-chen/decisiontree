export interface IDecision {
    id: number;
    text: string;
    pid: number;
    templateId: number;
}

export interface ITemplate {
    id: string;
    name: string;
    values: ITemplateValue[];
}

export interface ITemplateValue {
    key: string;
    value: string;
    type: string;
}

export interface ITemplateConfig {
    id: number;
    name: string;
    templates: ITemplate[];
    decisions: IDecision[];
}
