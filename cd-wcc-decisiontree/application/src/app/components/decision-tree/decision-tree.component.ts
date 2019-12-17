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

  public tree: any;
  public decisions: any;
  public template: any;
  public categoryId: number;
  public currentDecision: any;
  public decisionDesc: string;
  public decisionDescStack: Array<string>;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.decisionDescStack = [];
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

  private replacePlaceHolder(items: Array<any>) {
    items.forEach((item) => {
      item.value = item.value.replace(/{{user}}/, this.user);
    });
    return items;
  }

  public onMakeDecision(decision: any) {
    this.currentDecision = decision;
    this.decisionDescStack.push(decision.text);
    this.decisionDesc = this.getDescription(false);
    this.decisions = decision.children;
    if (decision && decision.templateId) {
      this.template = this.replacePlaceHolder(TemplateService.getTemplateData(this.categoryId, decision.templateId));
    }
    if (!decision.hasChildren) {
      this.decisionDesc = this.getDescription(true);
    }
  }

  public onGoBack() {
    if (this.currentDecision.parent) {
      this.currentDecision = this.currentDecision.parent;
      this.decisions = this.currentDecision.children;
      this.template = null;
      this.decisionDescStack.pop();
      this.decisionDesc = this.getDescription(false);
    } else {
      this.onGoRoot();
    }
  }

  public onGoRoot() {
    this.decisions = this.tree;
    this.currentDecision = null;
    this.template = null;
    this.decisionDescStack = [];
    this.decisionDesc = this.getDescription(false);
  }

  // private getDescription(ended: boolean) {
  //   let str = 'Customer want to ';
  //   const postFix = ' and ';
  //   this.decisionDescStack.forEach(desc => {
  //     str += desc + postFix;
  //   });
  //   if (ended) {
  //     str = str.replace(new RegExp(postFix + '$'), '');
  //   } else {
  //     str += '...';
  //   }
  //   return str;
  // }

  private getDescription(ended: boolean) {
    let str = '';
    const space = ' ';
    str = this.decisionDescStack.join(' ');
    if (!ended) {
      str += '...';
    }
    return str;
  }

  public continue() {
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, true);
  }

}
