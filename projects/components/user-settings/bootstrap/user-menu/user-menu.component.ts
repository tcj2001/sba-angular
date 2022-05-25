import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, InjectionToken, Inject, Optional } from '@angular/core';
import { merge, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Action } from '@sinequa/components/action';
import { PrincipalWebService, UserSettingsWebService } from '@sinequa/core/web-services';
import { AuthenticationService, LoginService, UserOverride } from '@sinequa/core/login';
import { IntlService, Locale } from '@sinequa/core/intl';
import { Utils } from '@sinequa/core/base';
import { BsOverrideUser } from '@sinequa/components/modal';
import { ModalService, ModalResult, ConfirmType, ModalButton } from '@sinequa/core/modal';
import { AppService } from '@sinequa/core/app-utils';
import { NotificationsService, NotificationType } from '@sinequa/core/notification';

/** A token that is used to inject the help folder options.
 *
 * Expects a {@link HelpFolderOptions} object.
*/
export const APP_HELP_FOLDER_OPTIONS = new InjectionToken<HelpFolderOptions>('APP_HELP_FOLDER_OPTIONS');
/**
 * `HelpFolderOptions` is an object with four properties: `name`, `indexFile`, `useLocale`, and
 * `useLocaleAsPrefix`.
 *
 * @property folder - The name of the folder.
 * @property indexFile - The name of the file that will be used as the index file for the folder.
 * @property useLocale - If true, the locale will be used to determine the folder to use.
 * @property useLocaleAsPrefix - If true, the locale will be used as a prefix for the help
 * folder. For example, if the locale is "en-US", the help folder will be inside "en-US/" folder.
 * If false, no locale will be used as a prefix.
 */
export type HelpFolderOptions = {
  path: string,
  folder?: string,
  indexFile?: string,
  useLocale?: boolean,
  useLocaleAsPrefix?: boolean
}

@Component({
  selector: 'sq-user-menu',
  templateUrl: './user-menu.component.html'
})
export class BsUserMenuComponent implements OnInit, OnDestroy {

  @Input() icon: string = "fas fa-user";
  @Input() autoAdjust: boolean = true;
  @Input() autoAdjustBreakpoint: string = 'xl';
  @Input() collapseBreakpoint: string = 'sm';
  @Input() size: string;
  @Input() enableDarkMode = true;
  @Input() showCredits = true;

  menu: Action;

  sep = new Action({separator: true});

  // User actions
  loginAction: Action;
  logoutAction: Action;
  overrideAction: Action;
  revertOverrideAction: Action;
  adminAction: Action;
  languageAction: Action;
  resetUserSettings: Action;
  darkModeAction: Action;
  creditAction: Action;
  helpAction: Action;


  /** helper function to retrieve the help html file accordingly with the current locale */
  private getHelpIndexUrl = (locale: string, options: HelpFolderOptions): string => {
    const { useLocale, useLocaleAsPrefix, indexFile, path, folder } = options;

    const localeFolder = useLocale ? `${locale}/` : null;
    const file = useLocaleAsPrefix ? `${locale}.${indexFile}` : indexFile ?? '';

    return [path, folder, `${localeFolder ? localeFolder : ''}${file}`]
      .filter(item => item !== undefined)
      .join('/');
  };

  constructor(
    public principalService: PrincipalWebService,
    public authenticationService: AuthenticationService,
    public intlService: IntlService,
    public loginService: LoginService,
    public modalService: ModalService,
    public appService: AppService,
    public userSettingsService: UserSettingsWebService,
    public notificationsService: NotificationsService,
    public changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(APP_HELP_FOLDER_OPTIONS) private helpDefaultFolderOptions: HelpFolderOptions | null | undefined) {

    // Actions objects are initialized in the constructor

    // User Menu

    // Login
    this.loginAction = new Action({
      text: "msg#userMenu.login",
      title: "msg#userMenu.login",
      action: () => {
        this.loginService.login();
      }
    });

    // Logout
    this.logoutAction = new Action({
      text: "msg#userMenu.logout",
      title: "msg#userMenu.logout",
      action: () => {
        this.loginService.logout();
        this.changeDetectorRef.markForCheck();
      }
    });

    // Override a user's identity
    this.overrideAction = new Action({
      text: "msg#userMenu.overrideUser",
      title: "msg#userMenu.overrideUser",
      action: () => {
        let userOverride = this.authenticationService.userOverride ?
          Utils.copy<UserOverride>(this.authenticationService.userOverride) : undefined;
        if (!userOverride) {
          userOverride = {
            userName: "",
            domain: ""
          };
        }
        this.modalService.open(BsOverrideUser, {model: userOverride})
          .then((result) => {
            if (result === ModalResult.OK) {
              this.loginService.overrideUser(userOverride);
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });

    // Cancel user override
    this.revertOverrideAction = new Action({
      text: "msg#userMenu.revertUserOverride",
      title: "msg#userMenu.revertUserOverride",
      action: () => {
        this.loginService.overrideUser(undefined);
        this.changeDetectorRef.markForCheck();
      }
    });

    // Link to the admin
    this.adminAction = new Action({
      text: "msg#userMenu.administration",
      title: "msg#userMenu.administration",
      href: this.appService.adminUrl
    });

    // Language menu
    this.languageAction = new Action({
      text: "msg#userMenu.language",
      title: "msg#userMenu.language",
      children: this.intlService.locales.map(locale =>
        new Action({
          text: locale.display,   // "French"
          title: locale.display,   // "French"
          data: locale,   // French locale
          selected: locale === this.intlService.currentLocale, // Whether French is the current locale
          iconAfter: "sq-image sq-flag-" + locale.name,
          action: (item: Action, $event: UIEvent) => {    // On click, switch to this language
            this.intlService.use((item.data as Locale).name).subscribe(
              (value) => this.languageAction.children!.forEach(a => a.update()));
          },
          updater: (action) => {  // Update the status of buttons
            action.selected = action.data === this.intlService.currentLocale;
          }
        })
      )
    });

    this.resetUserSettings = new Action({
      text: "msg#userMenu.resetUserSettings.menu",
      title: "msg#userMenu.resetUserSettings.menu",
      action: () => {
        this.modalService.confirm({
          title: "msg#userMenu.resetUserSettings.modalTitle",
          message: "msg#userMenu.resetUserSettings.modalMessage",
          buttons: [
            new ModalButton({result: ModalResult.OK, text: "msg#userMenu.resetUserSettings.modalConfirmButton"}),
            new ModalButton({result: ModalResult.Cancel, primary: true})
          ],
          confirmType: ConfirmType.Warning
        }).then(res => {
          if(res === ModalResult.OK) {
            this.userSettingsService.reset().subscribe({
              next: () => this.notificationsService.notify(NotificationType.Success, "msg#userMenu.resetUserSettings.successMessage"),
              error: () => this.notificationsService.notify(NotificationType.Error, "msg#userMenu.resetUserSettings.errorMessage")
            });
          }
        });
      }
    });

    this.darkModeAction = new Action({
      text: "msg#userMenu.darkMode",
      action: action => {
        document.body.classList.toggle("dark");
        localStorage.setItem('sinequa-theme', this.isDark()? 'dark' : 'normal');
        action.update();
      },
      updater: action => {
        action.icon = this.isDark()? "fas fa-toggle-on" : "fas fa-toggle-off";
        action.title = this.isDark()? "msg#userMenu.darkModeOn" : "msg#userMenu.darkModeOff";
      }
    });

    this.creditAction = new Action({
      href: "https://www.sinequa.com",
      target: "_blank",
      text: "msg#userMenu.credit",
      icon: "sq-logo"
    });

    this.helpAction = new Action({
      text: "msg#userMenu.help",
      target: "_blank"
    });

    // whenever login service's events, principal service's events or internationalization's event trigger, user's menu need to be updated
    const combine$ = merge(this.loginService.events.pipe(filter(event => event.type === "session-changed" || event.type === "session-start")), this.principalService.events, this.intlService.events);
    this.subscriptions$ = combine$.subscribe(event => this.updateMenu());
  }

  ngOnInit() {
    this.updateMenu();
  }

  private subscriptions$: Subscription;
  ngOnDestroy(){
    if(this.subscriptions$){
      this.subscriptions$.unsubscribe();
    }
  }

  updateMenu() {
    this.menu = new Action({
        icon: this.icon,
        text: this.loginService.complete && this.principalService.principal ? this.principalService.principal.name || "msg#userMenu.user" : "msg#userMenu.user",
        children: this.concatMenus([
          this.getLoginActions(),
          this.getUIActions(),
          this.getHelpActions(),
          this.getCreditActions()
        ])
    });
  }

  concatMenus(menus: Action[][]): Action[] {
    const menu = [] as Action[];
    for(let i=0; i<menus.length; i++) {
      if(menus[i].length > 0) {
        if(menu.length > 0) {
          menu.push(this.sep);
        }
        menu.push(...menus[i]);
      }
    }
    return menu;
  }

  getLoginActions(): Action[] {
    const actions: Action[] = [];

    if (!this.principalService.principal && !this.authenticationService.userOverrideActive) {
      actions.push(this.loginAction);
    }
    if (this.principalService.principal) {
      actions.push(this.logoutAction);
    }
    if (this.authenticationService.userOverrideActive) {
      actions.push(this.revertOverrideAction);
    }
    if (this.principalService.principal && this.principalService.principal.isAdministrator) {
      actions.push(this.overrideAction);
    }
    if (this.principalService.principal && (this.principalService.principal.isAdministrator || this.principalService.principal.isDelegatedAdmin)) {
      actions.push(this.adminAction);
    }
    if(this.loginService.complete) {
      actions.push(this.resetUserSettings);
    }
    return actions;
  }

  getUIActions(): Action[] {
    const actions: Action[] = [];
    if (this.intlService.locales.length > 1) {
      actions.push(this.languageAction);
    }
    if(this.enableDarkMode) {
      this.darkModeAction.update();
      actions.push(this.darkModeAction);
    }
    return actions;
  }

  getCreditActions(): Action[] {
    const actions = [] as Action[];
    if(this.showCredits) {
      actions.push(this.creditAction);
    }
    return actions;
  }

  getHelpActions(): Action[] {
    if (!this.loginService.complete) return [];

    // "options" could be undefined
    // "helpDefaultFolderOptions" could be null, in this case map it to undefined
    const options = this.appService.app?.data["help-folder-options"] as HelpFolderOptions;
    const defaults = this.helpDefaultFolderOptions ?? undefined;

    //  when 'options' and 'defaults' are undefined
    if (!options && !defaults) return [];

    if (options || defaults) {
      const { name } = this.intlService.currentLocale;
      const helpFolderOptions = {
        ...defaults,
        ...options,
      };
      this.helpAction.href = this.appService.helpUrl(this.getHelpIndexUrl(name, helpFolderOptions));
      return [this.helpAction];
    }

    return [];
  }

  /**
   * Whether the UI is in dark or light mode
   */
  isDark(): boolean {
    return document.body.classList.contains("dark");
  }

}
