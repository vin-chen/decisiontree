import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DecisionTreeComponent } from './components/decision-tree/decision-tree.component';
import { ConfigComponent } from './components/config/config.component';
import { NoteComponent } from './note/note.component';
import { FundamentalNgxModule } from 'fundamental-ngx';

const routes: Routes = [
  { path: 'config', component:  ConfigComponent},
  // { path: 'decision', component: DecisionTreeComponent },
  { path: 'decision/:id', component: DecisionTreeComponent },
  { path: 'note', component: NoteComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    DecisionTreeComponent,
    NoteComponent
  ],
  imports: [
    FormsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(routes),
    FundamentalNgxModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
