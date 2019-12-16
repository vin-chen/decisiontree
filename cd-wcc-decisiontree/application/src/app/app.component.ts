import { Component, OnInit } from '@angular/core';
import templates from './data/templates.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  private templates: Array<any>;

  ngOnInit(): void {
    this.templates = templates;
  }

}
