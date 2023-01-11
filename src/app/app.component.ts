import { Component, HostListener, OnDestroy, VERSION } from '@angular/core';
import { takeWhile, timer } from 'rxjs';

interface Position {
  id: string;
  x: number;
  y: number;
  body: boolean;
  food: boolean;
}

function factoryPosition(x: number, y: number): Position {
  return {
    x,
    y,
    id: [x, y].join(''),
    body: false,
    food: false,
  };
}

interface Point {
  x: number;
  y: number;
}

interface Body extends Point {
  checkpoints: Change[];
  h: number;
  v: number;
}

interface Change {
  h: number;
  v: number;
  x: number;
  y: number;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  private timer$ = timer(0, 600);
  private rows = 20;
  private cols = 20;
  board: Position[] = [];

  bodies: Body[] = [
    { y: 0, x: 0, checkpoints: [], h: 1, v: 0 },
    { y: 0, x: 1, checkpoints: [], h: 1, v: 0 },
    { y: 0, x: 2, checkpoints: [], h: 1, v: 0 },
    { y: 0, x: 3, checkpoints: [], h: 1, v: 0 },
  ];

  field: Array<Position[]> = [];

  private componentActive = true;

  @HostListener('window:keydown.ArrowDown')
  down() {
    this.addNewCheckpoint({ ...this.snakeHead, h: 0, v: 1 });
  }
  @HostListener('window:keydown.ArrowUp')
  top() {
    this.addNewCheckpoint({ ...this.snakeHead, h: 0, v: -1 });
  }
  @HostListener('window:keydown.ArrowRight')
  right() {
    this.addNewCheckpoint({ ...this.snakeHead, h: 1, v: 0 });
  }
  @HostListener('window:keydown.ArrowLeft')
  left() {
    this.addNewCheckpoint({ ...this.snakeHead, h: -1, v: 0 });
  }
  @HostListener('window:keydown.Enter')
  clock() {
    this.move();
  }

  constructor() {
    for (let i = 0; i < this.rows; i++) {
      this.field[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.field[i].push(factoryPosition(j, i));
      }
    }
    this.updateBody();

    timer(0, 600)
      .pipe(takeWhile(() => this.componentActive))
      .subscribe((t) => this.move());
  }

  ngOnDestroy() {
    this.componentActive = false;
  }

  get snakeSize(): number {
    return this.bodies.length;
  }

  get snakeHead(): Change {
    const { x, y, h, v } = this.bodies[this.bodies.length - 1];
    return { x, y, h, v };
  }

  addNewCheckpoint(checkpoint: Change) {
    this.bodies = this.bodies.map((body) => ({
      ...body,
      checkpoints: body.checkpoints.concat(checkpoint),
    }));
  }

  updateBody() {
    this.field.forEach((row) => {
      row.forEach((position) => {
        position.body = this.bodies.some(
          (body) => body.x === position.x && body.y === position.y
        );
      });
    });
  }

  move() {
    this.bodies = this.bodies.slice().map((body) => {
      if (body.checkpoints.length !== 0) {
        const checkpoint = body.checkpoints[0];
        const { x, y, h: ch, v: cv } = checkpoint;
        if (body.x === x && body.y === y) {
          body.checkpoints = body.checkpoints.slice(1);
          body.h = ch;
          body.v = cv;
        }
      }

      body.x += body.h;
      body.y += body.v;

      if (body.h === 0) {
        body.y = body.y >= this.cols ? 0 : body.y;
      }
      if (body.v === 0) {
        body.x = body.x >= this.rows ? 0 : body.x;
      }
      return body;
    });
    this.updateBody();
  }
}
