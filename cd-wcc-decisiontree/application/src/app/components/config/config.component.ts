import { Component, OnInit, TemplateRef } from '@angular/core';
import { ModalService } from 'fundamental-ngx';
import { ITemplateConfig, ITemplate, IDecision, ITemplateValue } from '../../data/ITemplate';
import { LocalstorageService } from '../../services/localStorage.service';

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

  constructor(private modalService: ModalService, private localStorage: LocalstorageService) {
    this.isCreatingTree = false;
    this.onEditDecision = this.initialDecision;
    this.onEditTemplate = this.initialTemplate;
    this.onEditTemplateConfig = this.initialTemplateConfig;
    this.onEditTemplateValues = [];
    this.noNameError = false;
    this.selectedTemplateConfig = null;
    if (!this.localStorage.templates) {
      this.localStorage.templates = templates;
    } 
  }

  ngOnInit() {
    this.templates = this.localStorage.templates;
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
    this.onEditTemplate = {...this.initialTemplate};
  }

  addTemplateValue() {
    const temp = {...this.initialTemplateValue}
    this.onEditTemplateValues.push(temp);
  }

  createTemplateConfig() {
    if (!this.onEditTemplateConfig.name) {
      this.noNameError = true;
      return;
    } else {
      this.onEditTemplateConfig.id = this.templates.length;
      const tempCongig = { ...this.onEditTemplateConfig };
      this.templates.push(tempCongig);
      this.localStorage.templates = this.templates;
      this.onEditTemplateConfig = {...this.initialTemplateConfig};
      this.isCreatingTree = false;
    }
  }

  selectTemplate(index, type) {
    this.selectedTemplateConfig = this.templates[index];
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
        this.deleteConfig(index);
        break;
      };
      default: {
        console.log(type);
        break;
      }
    }
  }

  public deleteConfig(index) {
    this.deleteItemFormArray(this.templates, index);
    this.localStorage.templates = this.templates;
  }

  public downloadFile() {
    console.log(this.selectedTemplateConfig);
  }

  public deleteTemplate(index) {
    this.deleteItemFormArray(this.onEditTemplateConfig.templates, index);
  }

  public deleteDecision(index) {
    this.deleteItemFormArray(this.onEditTemplateConfig.decisions, index);
  }

  public deleteItemFormArray(array: Array<any>, index: number) {
   array.splice(index, 1);
  }

}
