import { Component, OnInit } from '@angular/core';
import { BurgerMenuComponent } from '../burger-menu/burger-menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, BurgerMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  slideshowImages = [
    '/assets/header-bg/Alloco2.jpg',
    '/assets/header-bg/Avocados.jpg',
    '/assets/header-bg/Bissap.png',
    '/assets/header-bg/Chips2.jpg',
    '/assets/header-bg/Guinness.jpg',
    '/assets/header-bg/Ignam.jpg',
    '/assets/header-bg/NIDO.jpg',
    '/assets/header-bg/Schill.jpg',
    '/assets/header-bg/Vimto.jpg',
    '/assets/header-bg/Getraenke.jpg',
    '/assets/header-bg/vitamalt.jpg',
    '/assets/header-bg/Zitronen.jpg'
  ];
  currentSlide = 0;

  ngOnInit() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slideshowImages.length;
    }, 5000); // 5 secondes par image, fade plus doux
  }
}
