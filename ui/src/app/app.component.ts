import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ui';
  inputFile: any = null;

  uploadFile(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.inputFile = (element.name);
    }
  }

  deleteAttachment() {
    this.inputFile = null;
  }

  submit() {
    console.log('Submitting ', this.inputFile)
  }
}
