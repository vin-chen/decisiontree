import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SHELL_EVENTS, ShellSdk } from 'fsm-shell';
import { fromEvent } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';

declare var parent: Window | undefined;
declare var process: { env: { [k: string]: string } } | undefined;
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

  private shellSdk: ShellSdk;
  private isBrowser: boolean;
  public version: string;
  public user: string;
  public email = {
    fromAddress: '',
    toAddress: '',
    subject: '',
    content: ''
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private sanitizer: DomSanitizer) {
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
              output: {}
            });
            document.write('');
          })
        )
      ))
      .subscribe();

    ctx$.subscribe(
      res => {
        this.user = res.user;
        this.email = this.parseEmailObjectFromContext(res.initialContext);
      }
    );

    // ask flow runtime for flow context
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT, {
      // SECURITY WARNING! you should register your flow app with your platfrom in the real world.
      clientIdentifier: 'test-app-client-identifier',
      clientSecret: 'test-app-client-secret'
    });

  }

  public onSave() {
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, true);
  }

  private parseEmailObjectFromContext(initCont: any[]) {
    let email = {
      fromAddress: this.findValueByKeyFromContextArray(initCont, 'email_fromAddress'),
      toAddress: this.findValueByKeyFromContextArray(initCont, 'email_toAddress'),
      subject: this.findValueByKeyFromContextArray(initCont, 'email_subject'),
      content: this.findValueByKeyFromContextArray(initCont, 'email_content')
    };
    return email;
  }

  private findValueByKeyFromContextArray(initCont: any[], key: string) {
    let value: any;
    initCont.forEach((e) => {
      if (e.key === key) {
        value = e.value;
      }
    });
    return value;
  }

}
