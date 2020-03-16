import { Component, OnInit } from '@angular/core';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

import { ReportService } from '../../_services/report.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  loadingProjects = true;
  noProjectFound = false;
  projectsFound = false;

  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = [ 'October', 'November', 'December', 'January', 'February', 'March'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  barChartData: ChartDataSets[] = [
    { data: [], label: 'Average Monthly Work Hours' }
  ];

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.reportService.getAll()
    .subscribe(
        data => {
          if(data.length > 0){
            const oct = {totalHours: 0, count: 0}
            const nov = {totalHours: 0, count: 0}
            const dec = {totalHours: 0, count: 0}
            const jan = {totalHours: 0, count: 0}
            const feb = {totalHours: 0, count: 0}
            const mar = {totalHours: 0, count: 0}

            data.forEach(report => {
              let month = new Date(report.date).getMonth();
              if(month === 0){
                jan.totalHours += report.hours;
                jan.count += 1;
              }
              else if(month === 1){
                feb.totalHours += report.hours;
                feb.count += 1;
              }
              else if(month === 2){
                mar.totalHours += report.hours;
                mar.count += 1;
              }

              else if(month === 9){
                oct.totalHours += report.hours;
                oct.count += 1;
              }
              else if(month === 10){
                nov.totalHours += report.hours;
                nov.count += 1;
              }
              else if(month === 11){
                dec.totalHours += report.hours;
                dec.count += 1;
              }
            });

            const temp = [
              oct.totalHours > 0 ? Math.ceil(oct.totalHours/oct.count) : 0,
              nov.totalHours > 0 ? Math.ceil(nov.totalHours/nov.count) : 0,
              dec.totalHours > 0 ? Math.ceil(dec.totalHours/dec.count) : 0,
              jan.totalHours > 0 ? Math.ceil(jan.totalHours/jan.count) : 0,
              feb.totalHours > 0 ? Math.ceil(feb.totalHours/feb.count) : 0,
              mar.totalHours > 0 ? Math.ceil(mar.totalHours/mar.count) : 0
            ]

            this.barChartData[0].data = temp;
            this.projectsFound = true;
          }
          else {
             this.noProjectFound = true;
          }

          this.loadingProjects = false;
        },
        error => {
            alert(error.error.message);
            console.log('Loading projects error', error)
            this.loadingProjects = false;
        });
  }

}
