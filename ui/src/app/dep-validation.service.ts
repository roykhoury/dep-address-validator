import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepValidationService {
  depValidationUrl = 'https://dep-validator-backend.herokuapp.com/runValidation';

  constructor(private http: HttpClient) {}

  runValidation(file: File, withHeaders: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.set('withHeaders', withHeaders);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json'
      })
    };

    return this.http.post(this.depValidationUrl, formData, httpOptions);
  }
}
