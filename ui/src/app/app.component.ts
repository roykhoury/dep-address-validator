import {Component} from '@angular/core';
import {DepValidationService} from './dep-validation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ui';

  inputFile: File;
  withHeaders: string;
  errMsg: string;
  progress: number;

  constructor(
    private depValidationService: DepValidationService
  ) {
  }

  uploadFile(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.inputFile = (element.name);
    }
    this.getProgress(this.inputFile.name);
  }

  deleteAttachment() {
    this.inputFile = null;
  }

  getProgress(filename) {
    let progressInterval = setInterval(() => {

      if (this.progress == 100) {clearInterval(progressInterval)}

      this.depValidationService.getProgress(filename).subscribe(
        res => {this.errMsg = ''; this.progress = !isNaN(Number(res)) ? 0 : Number(res)},
        err => {this.errMsg = err.message; console.log(err);}
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
      res => { this.errMsg = ''; console.log(res); },
      err => { this.errMsg = err.message; console.log(err); },
      () => { this.errMsg = ''; console.log('completed'); }
      );
  }
}
