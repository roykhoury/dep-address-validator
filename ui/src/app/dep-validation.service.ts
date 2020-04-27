import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepValidationService {
  depValidationUrl = 'https://dep-validator-backend.herokuapp.com/runValidation';
  validationProgressUrl = 'https://dep-validator-backend.herokuapp.com/status';

  constructor(private http: HttpClient) { }

  runValidation(file, withHeaders: string) {
    let formData = new FormData();
    formData.set('withHeaders', withHeaders);
    formData.append('file', file);
    return this.http.post(this.depValidationUrl, formData);
  }

  getProgress(fileName: string) {
    return this.http.get(this.validationProgressUrl, { params: { output: fileName } });
  }
}
