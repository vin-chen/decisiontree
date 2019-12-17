import { Component, OnInit, TemplateRef } from '@angular/core';
import { ModalService } from 'fundamental-ngx';
import { ITemplateConfig, ITemplate, IDecision, ITemplateValue } from '../../data/ITemplate';

import templates from '../../data/templates.json';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'wcc-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  public templates: any;
  public uploadFiles: File[] = [];
  public uploadState: string = 'default';
  public isCreatingTree: boolean;
  public noNameError: boolean;
  private modalStyle: any = {
    backdropClickCloseable: false,
    minWidth: '30%'
  };
  public initialTemplateConfig: any = {
    id: null,
    name: '',
    templates: [],
    decisions: []
  }
  public initialDecision: IDecision = {
    id: null,
    text: '',
    pid: null,
    templateId: null
  };
  public initialTemplate: ITemplate = {
    id: null,
    name: '',
    values: []
  }
  public initialTemplateValue: ITemplateValue = {
    key: '',
    value: '',
    type: ''
  }
  public onEditDecision: IDecision;
  public onEditTemplateConfig: any;
  public onEditTemplate: ITemplate;
  public onEditTemplateValues: ITemplateValue[];
  public selectedTemplateConfig: ITemplateConfig;

  constructor(private modalService: ModalService) {
    this.isCreatingTree = false;
    this.onEditDecision = this.initialDecision;
    this.onEditTemplate = this.initialTemplate;
    this.onEditTemplateConfig = this.initialTemplateConfig;
    this.onEditTemplateValues = [];
    this.noNameError = false;
    this.selectedTemplateConfig = null;
  }

  ngOnInit() {
    this.templates = templates;
  }

  openCreatModal(modal: TemplateRef<any>): void {
    const modalRef = this.modalService.open(modal, this.modalStyle);
    modalRef.afterClosed.subscribe(result => {
      console.log(`modal close with ${result}`);
    }, error => {
      console.log(`modal close with ${error}`);
    });
  }

  selectHandler(passedFiles) {
    passedFiles.forEach(file => {
      if (this.uploadFiles.filter(eFile => (file.name === eFile.name)).length === 0) {
        this.uploadFiles.push(file);
      }
    });
    this.uploadState = 'default';
  }

  removeFile(index: number) {
    this.uploadFiles.splice(index, 1);
  }

  createTree() {
    this.modalService.dismissAll();
    this.isCreatingTree = true;
  }

  addDecision() {
    console.log(this.onEditDecision);
    const temp: IDecision = { ...this.onEditDecision };
    this.onEditTemplateConfig.decisions.push(temp);
    this.onEditDecision = this.initialDecision;
  }

  addTemplete() {
    // console.log(this.onEditTemplateValues);
    this.onEditTemplate.values = this.onEditTemplateValues;
    this.onEditTemplateValues = [];
    // console.log(this.onEditTemplate);
    const temp: ITemplate = { ...this.onEditTemplate };
    this.onEditTemplateConfig.templates.push(temp);
    this.onEditTemplate = this.initialTemplate;
  }

  addTemplateValue() {
    this.onEditTemplateValues.push(this.initialTemplateValue);
  }

  createTemplateConfig() {
    console.log(this.onEditTemplateConfig);
    if (!this.onEditTemplateConfig.name) {
      this.noNameError = true;
      return;
    } else {
      const tempCongig = { ...this.onEditTemplateConfig };
      this.templates.push(tempCongig);
      this.onEditTemplateConfig = this.initialTemplateConfig;
      this.isCreatingTree = false;
    }
  }

  selectTemplate(index, type) {
    this.selectedTemplateConfig = this.templates[index];
    console.log(this.selectedTemplateConfig);
    switch (type) {
      case 'detail': {
        console.log(`detail`);
        break;
      };
      case 'download': {
        console.log(`download`);
        break;
      };
      case 'delete': {
        console.log(`delete`);
        break;
      };
      default: {
        console.log(type);
        break;
      }
    }
  }

  public downloadFile() {
    console.log(this.selectedTemplateConfig);
  }

}
