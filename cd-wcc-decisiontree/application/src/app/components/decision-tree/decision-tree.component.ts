import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SHELL_EVENTS, ShellSdk } from 'fsm-shell';
import { fromEvent } from 'rxjs';
import { mergeMap, tap, switchMap } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TemplateService } from '../../services/template.service';

declare var parent: Window | undefined;
declare var process: { env: { [k: string]: string } } | undefined;
declare var YT: any;

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wcc-decision-tree',
  templateUrl: './decision-tree.component.html',
  styleUrls: ['./decision-tree.component.scss']
})
export class DecisionTreeComponent implements OnInit {
  stars: number[] = [1, 2, 3, 4, 5];
  selectedValue: number;
  private shellSdk: ShellSdk;
  private isBrowser: boolean;
  public version: string;
  private canContinue = false;
  public user: string;
  public show = false;

  private tree: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute) {
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
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return TemplateService.getTree(parseInt(params.get('id')));
      })
    ).subscribe((res) => {
      this.tree = res;
    });
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
        this.user = res.user;
      }
    );


    // ask flow runtime for flow context
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT, {
      // SECURITY WARNING! you should register your flow app with your platfrom in the real world.
      clientIdentifier: 'test-app-client-identifier',
      clientSecret: 'test-app-client-secret'
    });

  }

  countStar(star) {
    this.selectedValue = star;
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, this.selectedValue !== undefined);
  }

}
