import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import moment, {Moment} from "moment";
import {IDatasource} from "ngx-ui-scroll";
import {CalendarDay} from "../../models/calendar-day";
import {DatepickerService} from "../../service/datepicker-service";
import {DatepickerFactory} from "../../datepicker/datepicker-factory";
import {hexToRgb} from "../../helper/color-helper";

@Component({
    selector: 'apd-datepicker',
    templateUrl: './datepicker.component.html',
})
export class DatepickerComponent implements OnInit, OnChanges {
    @Input() darkMode: boolean = false
    @Input() primaryColor = '#38b0ac'
    @Input() calendarType: 'jalali' | 'gregorian' | 'hijri' = 'jalali'
    @Input() calendarMode: 'normal' | 'datepicker' | 'date-range-picker' = 'normal'

    @Output() onDateSelect: EventEmitter<any> = new EventEmitter<any>()
    @Output() onDateRangeSelect: EventEmitter<any> = new EventEmitter<any>()

    selectedDate!: any

    selectedStartDate!: any
    selectedEndDate!: any

    datasource!: IDatasource
    format: any = 'YYYY/MM/DD';
    calendarSelectorMode: "date" | "month" | "year" = "date"
    dates!: CalendarDay[][]
    dateService!: DatepickerService

    protected readonly moment = moment;

    constructor(private readonly element: ElementRef) {
        this.loadCalendar(new Date())
    }

    ngOnInit() {
        this.onColorChanges(this.primaryColor)
    }

    onPreviousMonthClick() {
        this.loadCalendar(this.dates[1][1].date.subtract(1, 'month'))
    }

    onNextMonthClick() {
        this.loadCalendar(this.dates[1][1].date.add(1, 'month'))
    }

    loadCalendar(date: Moment | Date) {
        this.dateService = new DatepickerService(date, DatepickerFactory.create(this.calendarType))
        this.dates = this.dateService.calendar()
        this.scrollToYear()
    }

    onColorChanges(color: string) {
        this.element.nativeElement.style.setProperty('--color-primary', hexToRgb(color));
    }

    onGoToTodayClick() {
        const now = moment()
        this.loadCalendar(now)
    }

    changeCurrentMonth(month: number) {
        const date = this.dateService.parseLocalDate(this.dateService.currentYear, month, 15)
        this.loadCalendar(date)
        this.calendarSelectorMode = 'date'
    }


    changeCurrentYear(year: number) {
        const date = this.dateService.parseLocalDate(year, this.dateService.currentMonth, 15)
        this.loadCalendar(date)
        this.calendarSelectorMode = 'month'
    }

    scrollToYear() {
        this.scrollToIndex(Math.floor(this.dateService.currentYear / 4) - 2)
    }

    onMonthToggle() {
        this.calendarSelectorMode = this.calendarSelectorMode === 'month' ? 'date' : 'month'
    }

    onYearToggle() {
        this.calendarSelectorMode = this.calendarSelectorMode === 'year' ? 'date' : 'year'
    }

    scrollToIndex(index: number) {
        this.datasource = {
            get: (index, count, success) => {
                const data = [];
                for (let i = index; i <= index + count - 1; i++) {
                    data.push(i);
                }
                success(data);
            },
            settings: {
                minIndex: 0,
                startIndex: index,
            },
        };
    }

    range(from: number, to: number, step: number) {
        return [...Array(Math.floor((to - from) / step) + 1)].map((_, i) => from + i * step);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['calendarType']) {
            this.calendarType = changes['calendarType'].currentValue
            this.loadCalendar(new Date())
        }

        if (changes['primaryColor']) {
            this.onColorChanges(changes['primaryColor'].currentValue)
        }

        if (changes['calendarMode']) {
            this.resetVariables()
        }
    }

    onNewDateSelect(date: CalendarDay) {
        if (this.calendarMode === 'date-range-picker' && this.selectedEndDate === undefined && this.selectedStartDate !== undefined && date.date.isBefore(this.selectedStartDate)) {
            return;
        }

        if (!date.isForCurrentMonth) {
            return;
        }

        if (this.calendarMode === 'normal') {
            return;
        }

        const selectedDate = date.date

        if (this.calendarMode === 'datepicker') {
            this.selectedDate = selectedDate
            this.onDateSelect.emit(selectedDate)
            return;
        }

        if (this.calendarMode === 'date-range-picker') {
            if (this.selectedStartDate === undefined || this.selectedEndDate !== undefined) {
                this.selectedStartDate = selectedDate
                this.selectedEndDate = undefined
            } else {
                this.selectedEndDate = selectedDate
            }
        }
    }

    private resetVariables() {
        this.selectedEndDate = undefined
        this.selectedStartDate = undefined
        this.selectedDate = undefined

    }
}
