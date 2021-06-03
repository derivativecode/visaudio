import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

const FFTSIZE = 128;
// const HEIGHT = ;
// const WIDTH = ;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})

export class HomeComponent implements OnInit, AfterViewInit {

  // VIEW BINDINGs
  @ViewChild('canvas', { static: false })
  canvasElement!: ElementRef;

  public canvasCtx!: CanvasRenderingContext2D;

  $audioElement!: HTMLAudioElement;
  @ViewChild('audio') set playerRef(ref: ElementRef<HTMLAudioElement>) {
    this.$audioElement = ref.nativeElement;
  }

  @ViewChild('audioPicker', { static: false })
  audioPickerElement!: ElementRef;

  audioContext = new window.AudioContext(); // || window.webkitAudioContext)();

  title = '';

  constructor() {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.canvasElement.nativeElement.width = window.innerWidth * .9;
    this.canvasElement.nativeElement.height = window.innerHeight * .9;
    this.canvasCtx = this.canvasElement.nativeElement.getContext('2d');
  }


  // LOAD FILE, READY ANIMATION
  public onPress = (event: Event) => {
    // get file
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.title = file.name;
    console.log(this.title);
    this.$audioElement.src = URL.createObjectURL(file);
    this.$audioElement.load();
    // this.$audioElement.play();

    // create media element
    const track = this.audioContext.createMediaElementSource(
      this.$audioElement
    );
    track.connect(this.audioContext.destination);

    // Analyzer node
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = FFTSIZE;  // 128;  // Number of Stripes
    track.connect(analyser);

    // Creating the array to store the frequency data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);


    // Some useful constants
    const WIDTH = this.canvasElement.nativeElement.width;
    const HEIGHT = this.canvasElement.nativeElement.height;
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;


    const w = WIDTH;
    const h = HEIGHT;

    const r1 = Math.min(w, h) * 0.1;    // outer radius
    const r0 = r1 - 1;                 // inner radius

    const n = 32;                       // number of blocks

    const theta = 2 * Math.PI / n;
    const phi = theta * 0.45;           // relative half-block width



    // let tick = 0;
    // let color = '#FF0000';

    // setInterval( () => {
    //   //console.log("tick");
    //   //color = this.redColors();
    //   tick++;
    // }, 100);

    // Colors used for plotting
    const MATTE_BLACK = '#1A202C';
    // const WHITE = '#FFFFFF';
    const WHITE = '#000000';

    // The function which will get called on each repaint
    /*
    const draw = () => {
      requestAnimationFrame(draw);
      if (this.canvasCtx !== null) {
        x = 0;
        analyser.getByteFrequencyData(dataArray);
        this.canvasCtx.fillStyle = WHITE;
        this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        // animate (draw) the bars
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          this.canvasCtx.fillStyle = MATTE_BLACK;
          //this.canvasCtx.fillRect(x, 0, barWidth, barHeight);

          // Render 2 Stripes from vertical middle, one up, one down
          this.canvasCtx.fillRect(x, HEIGHT/2, barWidth, barHeight/2);
          this.canvasCtx.fillRect(x, HEIGHT/2, barWidth, -barHeight/2);
          x += barWidth + 3;
        }
      }
    };
    draw();
  };
  */


    // CIRCLE ANIMATION
    const draw = () => {
      requestAnimationFrame(draw);
      if (this.canvasCtx !== null) {
        x = 0;
        analyser.getByteFrequencyData(dataArray);
        this.canvasCtx.fillStyle = WHITE;
        this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);



          // animate (draw) the bars

        this.canvasCtx.save();
          // this.canvasCtx.fillStyle = '#c0c0c0';
        this.canvasCtx.fillStyle = this.redColors();
        this.canvasCtx.translate(w / 2, h / 2);      // move to center of circle

        for (let j = 0; j < n; ++j) {
              // for (let i = 0; i < bufferLength; i++) {
              // barHeight = dataArray[(j+tick)%j];
              barHeight = dataArray[j];
              console.log(barHeight);
              this.canvasCtx.beginPath();
              this.canvasCtx.arc(0, 0, r0 + barHeight / 2, -phi, phi);
              this.canvasCtx.arc(0, 0, r1 + barHeight, phi, -phi, true);
              this.canvasCtx.fillStyle = this.redColors(); // this.redCol(barHeight);
              this.canvasCtx.fill();
              this.canvasCtx.rotate(theta);            // rotate the coordinates by one block; add integer for interesting effect
              // }
          }
        this.canvasCtx.restore();

          // // rotate animation even further?
          // var ang = 0;
          // setInterval( () => {
          //   console.log("tick");
          //   this.canvasCtx.save();
          //   this.canvasCtx.translate(WIDTH/2, HEIGHT/2);
          //   this.canvasCtx.rotate(Math.PI / 180 * (ang += 5));
          //   this.canvasCtx.restore();
          // }, 5000);
      }
    };
    draw();
  }




  // BUTTONS
  public resetAnim(): void {
    this.$audioElement.load();
  }

  public playAnim(): void {
    this.$audioElement.play();
  }

  public pauseAnim(): void {
    this.$audioElement.pause();
  }


  public pastelColors(): string {
    const r = (Math.round(Math.random() * 127) + 127).toString(16);
    const g = (Math.round(Math.random() * 127) + 127).toString(16);
    const b = (Math.round(Math.random() * 127) + 127).toString(16);
    return '#' + r + g + b;
  }

  public redColors(): string {
    const r = (Math.round(Math.random() * 255)).toString(16);
    // var g = (Math.round(Math.random()* 2) + 0).toString(16);
    // var b = (Math.round(Math.random()* 2) + 0).toString(16);
    return '#' + r + '00' + '00';
  }

  public redCol(val: number): string {
    const r = (Math.round(Math.random() * val)).toString(16);
    // var g = (Math.round(Math.random()* 2) + 0).toString(16);
    // var b = (Math.round(Math.random()* 2) + 0).toString(16);
    return '#' + r + '00' + '00';
  }
}
