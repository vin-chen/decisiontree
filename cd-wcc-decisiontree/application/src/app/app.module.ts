import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DecisionTreeComponent } from './decision-tree/decision-tree.component';
import { ConfigComponent } from './config/config.component';

const routes: Routes = [
  { path: 'config', component:  ConfigComponent},
  { path: 'decision', component: DecisionTreeComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    DecisionTreeComponent
  ],
  imports: [
    FormsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
