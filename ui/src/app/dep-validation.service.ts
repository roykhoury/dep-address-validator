import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepValidationService {
  depValidationUrl = 'https://dep-validator-backend.herokuapp.com/runValidation';
  validationProgressUrl = 'https://dep-validator-backend.herokuapp.com/status';
  downloadOutputUrl = 'https://dep-validator-backend.herokuapp.com/download';
  
  constructor(private http: HttpClient) { }

  runValidation(file, headersCount: string) {
    let formData = new FormData();
    formData.set('headersCount', headersCount ? headersCount : '1');
    formData.append('file', file);
    return this.http.post(this.depValidationUrl, formData);
  }

  getProgress(fileName: string) {
    return this.http.get(this.validationProgressUrl, { params: { output: fileName }});
  }

  downloadOutputFile(fileName: string) {
    return this.http.get(this.downloadOutputUrl, { params: { output: fileName }, responseType: 'blob'});
  }
}
