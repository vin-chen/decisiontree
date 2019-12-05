import { isPlatformBrowser } from '@angular/common';
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

  private shellSdk: ShellSdk;
  private isBrowser: boolean;
  public version: string;
  public context: string;
  public myMsg = 'some';

  constructor(@Inject(PLATFORM_ID) private platformId, private sanitizer: DomSanitizer) {
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
    const ctx$ = fromEvent<{ user: string, initialContext: Array<{ 'name': string, 'value': any, 'type': any }> }>(this.shellSdk, SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT);

    ctx$
      .pipe(mergeMap(
        // handle flow runtime "next"-button click
        _ => onContinue$.pipe(
          // this will response the "result value" output context back to the flow-runtime
          tap(result => {
            this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.ON_CONTINUE, {
              output: [{
                name: 'myMsgContent',
                value: this.myMsg
              }]
            });
            document.write('');
          })
        )
      ))
      .subscribe();

    ctx$.subscribe(
      res => {
        this.context = JSON.stringify(res);
      }
    );


    // ask flow runtime for flow context
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT, {
      // SECURITY WARNING! you should register your flow app with your platfrom in the real world.
      clientIdentifier: 'test-app-client-identifier',
      clientSecret: 'test-app-client-secret'
    });

  }

  canContinue(can: boolean) {
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, can);
  }

}
