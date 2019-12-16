import { Component, OnInit } from '@angular/core';
import templates from './data/templates.json';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { TemplateService } from './services/template.service.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  private templates: Array<any>;

  public constructor() {

  }

  public ngOnInit(): void {
    this.templates = templates;
  }

}
