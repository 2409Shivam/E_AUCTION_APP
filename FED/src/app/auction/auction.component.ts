import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Player {
  _id?: string;
  name: string;
  role: string;
  profilePic: string;
}

interface Marker {
  index: number;
  label: string; // e.g., "Batsman Set 1"
}

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {
  players: Player[] = [];
  markers: Marker[] = [];
  markerMap: Map<number, string> = new Map();
  currentIndex = 0;
  currentPlayer: Player | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ players: Player[]; markers: Marker[] }>('http://localhost:5000/api/players/auction-order')
      .subscribe({
        next: (data) => {
          this.players = data.players || [];
          this.markers = data.markers || [];
          this.markerMap = new Map(this.markers.map(m => [m.index, m.label]));

          if (this.players.length > 0) {
            this.currentIndex = 0;
            this.currentPlayer = this.players[this.currentIndex];
          }
        },
        error: (err) => console.error('Error loading auction order:', err)
      });
  }

  nextPlayer() {
    if (this.currentIndex < this.players.length - 1) {
      this.currentIndex++;
      this.currentPlayer = this.players[this.currentIndex];
    }
  }

  prevPlayer() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentPlayer = this.players[this.currentIndex];
    }
  }

  getRolePrompt(): string | null {
    // show prompt when current index is the start of a set (marker)
    return this.markerMap.get(this.currentIndex) || null;
  }
}
