import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SHELL_EVENTS, ShellSdk } from 'fsm-shell';
import { fromEvent } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

declare var parent: Window | undefined;
declare var process: { env: { [k: string]: string } } | undefined;
declare var YT: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  selectedValue: number;
  private shellSdk: ShellSdk;
  private isBrowser: boolean;
  public version: string;

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
              output: [{
                name: 'rating',
                value: this.selectedValue
              }]
            });
            document.write('');
          })
        )
      ))
      .subscribe();

    ctx$.subscribe(
      res => {
        const body = {
          type: res.initialContext.find(e => 'caseAction_type' === e.name).value,
          content: res.initialContext.find(e => 'caseAction_content' === e.name).value,
          case_: res.initialContext.find(e => 'caseAction_id' === e.name).value
        };
        // tslint:disable-next-line:max-line-length
        this.http.post(`https://${res.cloudHost}/api/data/v4/CaseAction?account=${res.account}&company=${res.company}&user=${res.user}&clientIdentifier=COR_SERVICE_CLOUD&dtos=CaseAction.8`, body, {
          headers: {
            'Content-Type': 'application/json',
            Host: res.cloudHost,
            Authorization: res.authToken,
            'X-Client-ID': 'case-action',
            'X-Client-Version': '1.0.0',
          }
        }).subscribe(
          (response) => {
            this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, response);
            this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.ON_CONTINUE, {
              output: []
            });
          }
        );
      }
    );


    // ask flow runtime for flow context
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT, {
      // SECURITY WARNING! you should register your flow app with your platfrom in the real world.
      clientIdentifier: 'case-action',
      clientSecret: '###$$$###'
    });

  }
}
