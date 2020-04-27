import { Component } from '@angular/core';
import { DepValidationService } from './dep-validation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ui';

  inputFile: File;
  inputFilename: string;
  outputFilename: string;
  withHeaders: string;
  errMsg: string;
  progress: number;

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
  }

  getProgress() {
    let progressInterval = setInterval(() => {
      console.log(this.progress);
      if (this.progress == 100)
        clearInterval(progressInterval)

      this.depValidationService.getProgress(this.outputFilename)
        .subscribe(
          res => {
            this.errMsg = '';
            this.progress = !isNaN(Number(res)) ? 0 : Number(res);
          },
          err => {
            this.errMsg = err.message;
            console.log(err);
          }
        );
    }, 1000);
  }

  submit() {
    console.log('Submitting ', this.inputFile);
    if (this.inputFile == null) {
      this.errMsg = 'Error while submitting request!';
      return null;
    }

    this.depValidationService.runValidation(this.inputFile, this.withHeaders)
      .subscribe(
        res => {
          this.errMsg = '';
          this.outputFilename = res.output;
          this.getProgress();
        }, err => {
          this.errMsg = err.message;
          console.log(err);
        });
  }
}
