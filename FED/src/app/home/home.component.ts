import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedFile: File | null = null;
  fileName: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
    }
  }

  onUpload() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<any>('http://localhost:5000/api/players/upload', formData)
        .subscribe({
          next: (res) => {
            alert('Upload successful!');
            console.log('Response:', res);
            // ✅ Navigate to /auction
            this.router.navigate(['/auction']);
          },
          error: (err) => {
            console.error('Upload failed:', err);
            alert('Upload failed, check console.');
          }
        });
    }
  }
}
