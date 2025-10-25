import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kontakt.component.html',
  styleUrls: ['./kontakt.component.css']
})
export class KontaktComponent {
  name: string = '';
  email: string = '';
  message: string = '';
  submitted: boolean = false;

  submitForm() {
    this.submitted = true;
    // Ici, tu pourrais envoyer le message à une API ou par email
  }
}
