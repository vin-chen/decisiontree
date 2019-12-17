import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SHELL_EVENTS, ShellSdk } from 'fsm-shell';
import { fromEvent } from 'rxjs';
import { mergeMap, tap, map } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TemplateService } from '../../services/template.service';

declare var parent: Window | undefined;
declare var process: { env: { [k: string]: string } } | undefined;

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wcc-decision-tree',
  templateUrl: './decision-tree.component.html',
  styleUrls: ['./decision-tree.component.scss']
})
export class DecisionTreeComponent implements OnInit {
  private shellSdk: ShellSdk;
  private isBrowser: boolean;
  public version: string;
  public user: string;

  private tree: any;
  private decisions: any;
  private template: any;
  private categoryId: number;
  private currentDecision: any;
  private decisionDesc: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.decisionDesc = "Customer want to ";
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
      map((params: ParamMap): Array<any> => {
        this.categoryId = parseInt(params.get('id'));
        return TemplateService.getTree(this.categoryId);
      })
    ).subscribe((res) => {
      this.tree = res;
      this.decisions = this.tree;
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
              output: this.template
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

  public onMakeDecision(decision: any) {
    this.currentDecision = decision;
    this.decisionDesc += decision.text;
    this.decisions = decision.children;
    if (decision && decision.templateId) {
      this.template = TemplateService.getTemplateData(this.categoryId, decision.templateId);
    }
    if (decision.hasChildren) {
      this.decisionDesc += ", and ";
    }
  }

  public onGoBack() {
    if (this.currentDecision.parent) {
      this.currentDecision = this.currentDecision.parent;
      this.decisions = this.currentDecision.children;
      this.template = null;
    } else {
      this.onGoRoot();
    }
  }

  public onGoRoot() {
    this.decisions = this.tree;
    this.currentDecision = null;
    this.template = null;
  }

  private continue() {
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, true);
  }

}
