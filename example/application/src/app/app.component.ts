import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, fromEventPattern, timer, fromEvent } from 'rxjs';
import { tap, mergeMap, combineLatest } from 'rxjs/operators';
import { ShellSdk, SHELL_EVENTS } from 'fsm-shell';
import { isPlatformBrowser } from '@angular/common';

declare var parent: Window | undefined;
declare var process: { env: { [k: string]: string } } | undefined;
declare var YT: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private shellSdk;
  private isBrowser: boolean;

  public version: string;
  public dynamic$ = new BehaviorSubject<string | number>('waiting...');
  public flowUser$ = new BehaviorSubject<string | number>(undefined);

  constructor(@Inject(PLATFORM_ID) private platformId) {
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

  videoSetup() {
    return new Promise((done, error) => {
      const player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: 'iOHllRzsEso',
        playerVars: { 'autoplay': 1, 'controls': 0 },
        events: {
          'onReady': (event: any) => {
            // event.target.playVideo() auto play
          },
          'onStateChange': (event: any) => {

            if (event.data == YT.PlayerState.PLAYING) {

              // lock the flow next button
              this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, false);

            }

            if (event.data == YT.PlayerState.ENDED) {

              document.querySelectorAll('#player')[0].remove();
              done();

            }
          }
        }
      });
    })
  }

  private connectToFlowRuntime() {

    // SECURITY WARNING! in the real world remove "*" put here your flow-runtime host.
    this.shellSdk = ShellSdk.init(parent as Window, '*');

    const onContinue$ = fromEvent<undefined>(this.shellSdk, SHELL_EVENTS.Version1.FLOWS.ON_CONTINUE);
    const ctx$ = fromEvent<{ user: string }>(this.shellSdk, SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT);

    ctx$
      .pipe(mergeMap(

        // handle flow runtime "next"-button click
        _ => onContinue$.pipe(

          // we could do some kind of "SAVE that you have watched" action here.
          mergeMap(() => timer(1000)),
          mergeMap(() => this.dynamic$),

          // this will response the "result value" output context back to the flow-runtime
          tap(result => {
            this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.ON_CONTINUE, {
              output: [
                {
                  name: "youtubeResult",
                  value: result
                }
              ]
            });
            document.write('');
          })
        )
      ))
      .subscribe();


    ctx$
      .pipe(

        // wait for the youtube player to load see index.html
        combineLatest(
          fromEvent(window, 'YouTubeIframeAPIReady').pipe(
            tap(_ => this.dynamic$.next('... watch the video! - you should not be able to go next without watching :) '))
          )),

        // wait for flow context
        tap(([flowContext, _]) => {

          this.flowUser$.next(flowContext.user);
          this.videoSetup()
            .then(e => {

              // unlock the flow next button so the user can move to the next step
              this.dynamic$.next('thanks for watching! -> ' + new Date().toISOString());
              this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.CAN_CONTINUE, true);

            });

        })
      ).subscribe();


    this.dynamic$.next('... waiting for flow context');

    // ask flow runtime for flow context
    this.shellSdk.emit(SHELL_EVENTS.Version1.FLOWS.REQUIRE_CONTEXT, {
      // SECURITY WARNING! you should register your flow app with your platfrom in the real world.
      clientIdentifier: 'test-app-client-identifier',
      clientSecret: 'test-app-client-secret'
    });

    // fix loading race with youtube 
    window.dispatchEvent(new Event('AngularSetupDone'));
  }

}
