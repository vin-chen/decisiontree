import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DecisionTreeComponent } from './components/decision-tree/decision-tree.component';
import { ConfigComponent } from './components/config/config.component';
import { NoteComponent } from './components/note/note.component';
import { EmailComponent } from './components/email/email.component';
import { FundamentalNgxModule } from 'fundamental-ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocalstorageService } from './services/localStorage.service';
import { TemplateService } from './services/template.service';

const routes: Routes = [
  { path: 'config', component:  ConfigComponent},
  { path: 'decision/:id', component: DecisionTreeComponent },
  { path: 'note', component: NoteComponent },
  { path: 'email', component: EmailComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    DecisionTreeComponent,
    NoteComponent,
    EmailComponent
  ],
  imports: [
    FormsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(routes),
    FundamentalNgxModule,
    BrowserAnimationsModule
  ],
  providers: [
    LocalstorageService,
    TemplateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
