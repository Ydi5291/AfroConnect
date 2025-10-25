import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'app-hilfe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hilfe.component.html',
  styleUrls: ['./hilfe.component.css']
})
export class HilfeComponent {}
