import {Pipe, ChangeDetectorRef, PipeTransform} from "@angular/core";
import {AbstractIntlPipe, IntlService} from "@sinequa/core/intl";

@Pipe({name: "sqTime", pure: false})
export class TimePipe extends AbstractIntlPipe implements PipeTransform {
    constructor(
        intlService: IntlService,
        changeDetectorRef: ChangeDetectorRef) {
        super(intlService, changeDetectorRef);
    }

    updateValue(key: number | Date, params: Intl.DateTimeFormatOptions): void {
        super.updateValue(key, params);
        this.value = this.intlService.formatTime(key, params);
    }
}