import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SHELL_EVENTS, ShellSdk } from 'fsm-shell';
import { fromEvent } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { ContextVariable } from './context-variable';

declare var parent: Window | undefined;
declare var process: { env: { [k: string]: string } } | undefined;
declare var YT: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private shellSdk: ShellSdk;
  private isBrowser: boolean;
  public version: string;

  public contextMap: ContextVariable[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId, private sanitizer: DomSanitizer, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // browser side rendering only
      this.connectToFlowRuntime();
    } else {
      // server side rendering only
      this.version = process.env.VERSION;
    }
  }

  private connectToFlowRuntime() {

    // SECURITY WARNING! in the real world remove "*" put here your flow-runtime host.
    this.shellSdk = ShellSdk.init(parent as Window, '*');

    const onContinue$ = fromEvent<undefined>(this.shellSdk, SHELL_EVENTS.Version1.FLOWS.ON_CONTINUE);

    const ctx$ = fromEvent<{
      account: string | undefined,
      accountId: number | undefined,
      authToken: string | undefined,
      cloudHost: string | undefined,
      company: string | undefined,
      companyId: number | undefined,
      selectedLocale: string | undefined,
      user: string | undefined,
      userId: number | undefined,
      initialContext: Array<{ 'name': string, 'value': any, 'type': any }>
    }>(this.shellSdk, SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT);

    ctx$
      .pipe(mergeMap(
        // handle flow runtime "next"-button click
        _ => onContinue$.pipe(
          // this will response the "result value" output context back to the flow-runtime
          tap(result => {
            this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.ON_CONTINUE, {
              output: this.contextMap.map((entry) => {
                return {
                  type: entry.newType,
                  name: entry.newName,
                  value: entry.newValue
                };
              })
            });
            document.write('');
          })
        )
      ))
      .subscribe();

    ctx$.subscribe(
      res => {
        if (res.initialContext && res.initialContext.length) {
          res.initialContext.forEach((variable) => {
            const cV = new ContextVariable();
            cV.oldType = variable.type || 'string';
            cV.oldName = variable.name;
            cV.oldValue = variable.value;
            cV.newValue = cV.oldValue;
            cV.newName = cV.oldName;
            cV.newType = cV.oldType;
            this.contextMap.push(cV);
          });
        }
      }
    );

    // ask flow runtime for flow context
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT, {
      // SECURITY WARNING! you should register your flow app with your platfrom in the real world.
      clientIdentifier: 'reg-i511895-context-mapper',
      clientSecret: '###$$$###'
    });

    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, true);

  }
}
