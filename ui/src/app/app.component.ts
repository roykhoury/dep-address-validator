import { Component, ViewChild, ElementRef } from '@angular/core';
import { DepValidationService } from './dep-validation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ui'; // to be removed

  @ViewChild('fileInput') fileInputField: ElementRef;

  inputFile: File;
  inputFilename: string;
  outputFilename: string;
  headersCount: string;
  errMsg: string;
  progress: number;
  loading: boolean;

  constructor(
    private depValidationService: DepValidationService
  ) {
  }

  onDragAndDropChange(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.inputFile = element;
      this.inputFilename = (element.name);
    }
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      this.inputFile = file
      this.inputFilename = file.name;
    }
  }

  deleteAttachment() {
    this.inputFile = null;
    this.inputFilename = null;
    this.fileInputField.nativeElement.value = null;
  }

  getProgress() {
    let progressInterval = setInterval(() => {
      console.log(this.progress);
      if (this.progress == 100) {
        clearInterval(progressInterval)
        this.loading = false;
      }

      this.depValidationService.getProgress(this.outputFilename)
        .subscribe(
          res => {
            this.errMsg = '';
            this.progress = Number(res);
          },
          err => {
            this.errMsg = err.message;
            console.log(err);
          }
        );
    }, 1000);
  }

  downloadOutput() {
    this.depValidationService.downloadOutputFile(this.outputFilename)
      .subscribe(
        res => {
          let blob = new Blob([res], {type: 'application/csv'});
          var downloadURL = window.URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.href = downloadURL;
          link.download = "results.csv";
          link.click();
        }
      )
  }

  submit() {
    if (this.inputFile == null) {
      this.errMsg = 'Error while submitting request!';
      return null;
    }

    this.progress = 0;
    this.loading = true;
    this.depValidationService.runValidation(this.inputFile, this.headersCount)
      .subscribe(
        res => {
          this.errMsg = '';
          this.outputFilename = res['output'];

          this.getProgress();
        }, err => {
          this.errMsg = err.message;
          console.log(err);
        });
  }
}
