import { Component, OnInit } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { ReportService } from '../../_services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  today = '';

  constructor(private reportService: ReportService) {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    const yyyy = today.getFullYear();
    
    let day = ''+dd;
    let month = ''+mm;

    if(dd < 10){
      day = '0'+dd
    } 

    if(mm < 10){
        month='0'+mm
    } 

    this.today = `${yyyy}-${month}-${day}`;
  }

  loadingProjects = true;
  noProjectFound = false;

  displayedColumns: string[] = ['position', 'name', 'hours', 'date'];
  dataSource = new MatTableDataSource([]);

  addingProject = false;
  addBtnText = 'Add project';

  newProjectName = '';
  newProjectHours = 1;
  newProjectDate = '';

  ngOnInit(): void {
    this.reportService.getAll()
    .subscribe(
        data => {
          const temp = data.map(d=> {
            return {...d, date: new Date(d.date).toDateString()}
          })
          this.dataSource = new MatTableDataSource([
            ...temp
          ])

          this.loadingProjects = false;
        },
        error => {
            alert(error.error.message);
            console.log('Loading projects error', error)
            this.loadingProjects = false;
        });
  }

  onNameKey(event: any) {
    this.newProjectName = event.target.value;
  }

  onHoursKey(event: any) {
    this.newProjectHours = Number(event.target.value);
  }

  onDateKey(event: any) {
    this.newProjectDate = event.target.value
  }

  addProject(){
    if(!this.newProjectName){
      alert('Add project name...');
      return
    }

    if(!this.newProjectDate){
      alert('Add project date...');
      return
    }

    this.addBtnText = "Adding project...";
    this.addingProject = true;

    this.reportService.saveNewReport(this.newProjectName, this.newProjectHours, new Date(this.newProjectDate))
      .subscribe(
          data => {
            this.dataSource = new MatTableDataSource([
              {
                name: this.newProjectName,
                hours: this.newProjectHours,
                date: new Date(this.newProjectDate).toDateString()
              }, 
              ...this.dataSource.data
            ])

            this.newProjectName = '';
            this.newProjectHours = 1;
            this.newProjectDate = '';

            this.addingProject = false;
            alert('Project added successfully.')
          },
          error => {
              alert(error.error.message);
              console.log('Saving project error', error)
              this.addingProject = false;
              this.addBtnText = 'Add project'
          });
  }
}
