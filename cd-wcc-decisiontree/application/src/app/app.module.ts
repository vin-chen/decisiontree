import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DecisionTreeComponent } from './components/decision-tree/decision-tree.component';
import { ConfigComponent } from './components/config/config.component';

const routes: Routes = [
  { path: 'config', component:  ConfigComponent},
  { path: 'decision', component: DecisionTreeComponent },
  { path: 'decision/:id', component: DecisionTreeComponent },
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
