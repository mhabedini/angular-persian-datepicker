import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewContainerRef
} from "@angular/core";
import {DatepickerPopupComponent} from "../components/datepicker-popup/datepicker-popup.component";
import {randomStr} from "../helper/color-helper";
import {DateRange} from "../models/date-range";
import {Moment} from "moment";
import {CalendarType} from "../models/calendar-type";
import {CalendarMode} from "../models/calendar-mode";

@Directive({selector: '[adp-datepicker]'})
export class ApdDatepickerDirective {
  componentRef!: ComponentRef<DatepickerPopupComponent> | null
  host!: any
  id!: string

  @Input() calendarType: CalendarType = CalendarType.JALALI
  @Input() calendarMode: CalendarMode = CalendarMode.DATEPICKER
  @Input() darkMode: boolean = false
  @Input() primaryColor = '#38b0ac'

  @Output() onDateRangeSelect = new EventEmitter<DateRange>
  @Output() onDateSelect = new EventEmitter<Moment>

  selectedDate!: Moment | undefined
  selectedRange!: DateRange | undefined

  constructor(private element: ElementRef, private viewContainerRef: ViewContainerRef) {

  }

  private clickInside = false;


  @HostListener('click')
  onClick() {
    this.resetVariables()

    this.clickInside = true
    if (this.componentRef) {
      this.removeDatepicker()
      return
    }

    this.host = this.element.nativeElement
    this.id = randomStr('adp-datepicker-popup-')
    this.componentRef = this.viewContainerRef.createComponent(DatepickerPopupComponent);
    const rect = this.host.getBoundingClientRect();
    this.componentRef.setInput('id', this.id)

    if (this.calendarType) {
      this.componentRef.setInput('calendarType', this.calendarType);
    }
    if (this.calendarMode) {
      this.componentRef.setInput('calendarMode', this.calendarMode)
    }
    if (this.darkMode) {
      this.componentRef.setInput('darkMode', this.darkMode)
    }
    if (this.primaryColor) {
      this.componentRef.setInput('primaryColor', this.primaryColor)
    }
    if (this.selectedDate) {
      this.componentRef.setInput('date', this.selectedDate)
    }
    if (this.selectedRange) {
      this.componentRef.setInput('dateRange', this.selectedRange)
    }

    this.componentRef.instance.onDateSelect.subscribe(val => {
      this.selectedDate = val
      if (this.element.nativeElement instanceof HTMLInputElement) {
        this.element.nativeElement.value = val.format('YYYY/MM/DD');
      }
      this.onDateSelect.emit(val);
      this.removeDatepicker()
    });

    this.componentRef.instance.onDateRangeSelect.subscribe(val => {
      this.selectedRange = val
      this.onDateRangeSelect.emit(val)
      this.element.nativeElement.value = val.startDate.format('YYYY/MM/DD') + ' - ' + val.endDate.format('YYYY/MM/DD');
      this.removeDatepicker()
    });

    if (window.innerHeight < rect.bottom + 510) {
      this.componentRef.setInput('bottom', window.innerHeight - rect.top + 4)
      this.componentRef.setInput('top', 'unset')
    } else {
      this.componentRef.setInput('top', rect.bottom + 4);
      this.componentRef.setInput('bottom', 'unset');
    }


    if (document.dir === 'rtl') {
      this.componentRef.setInput('right', rect.left);
      this.componentRef.setInput('left', 'unset');
    } else {
      this.componentRef.setInput('left', rect.left);
      this.componentRef.setInput('right', 'unset');
    }
    this.host.before(this.componentRef.location.nativeElement);


    setTimeout(() => {
      const element = document.getElementById(this.id)
      if (element) {
        element.onclick = () => {
          this.clickInside = true
        }
      }
    })
  }

  resetVariables() {
    if (this.calendarMode === CalendarMode.DATEPICKER) {
      this.selectedRange = undefined
      return
    }

    if (this.calendarMode === CalendarMode.DATE_RANGE_PICKER) {
      this.selectedDate = undefined
      return;
    }

    if (this.calendarMode === CalendarMode.NORMAL) {
      this.selectedDate = undefined
      this.selectedRange = undefined
      return;
    }
  }

  @HostListener('document:click')
  clickOutside(): void {
    if (!this.clickInside) {
      this.removeDatepicker();
    }
    this.clickInside = false;
  }

  removeDatepicker() {
    document.getElementById(this.id)?.remove();
    this.componentRef = null
  }
}
