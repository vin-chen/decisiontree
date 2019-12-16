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
  public inputTemplateConfig: any;
  public uploadFiles: File[] = [];
  public uploadState: string = 'default';
  public isCreatingTree: boolean;
  public inputDecisions: IDecision[];
  public inputTemplates: ITemplateValue[];
  private modalStyle: any = {
    backdropClickCloseable: false,
    minWidth: '30%'
  };

  constructor(private modalService: ModalService) {
    this.isCreatingTree = true;
  }

  ngOnInit() {
    this.templates = templates;
    this.inputTemplateConfig = templates[0];
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

}
