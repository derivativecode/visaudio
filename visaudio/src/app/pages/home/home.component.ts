import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';


const FFTSIZE = 512;
//const HEIGHT = ;
//const WIDTH = ;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})

export class HomeComponent implements OnInit {

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

  audioContext = new window.AudioContext(); //|| window.webkitAudioContext)();


  constructor() {

  }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.canvasElement.nativeElement.width = window.innerWidth;
    this.canvasElement.nativeElement.height = window.innerHeight;
    this.canvasCtx = this.canvasElement.nativeElement.getContext('2d');
  }


  // LOAD FILE, READY ANIMATION
  public onPress = (event: Event) => {
    // get file
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.$audioElement.src = URL.createObjectURL(file);
    this.$audioElement.load();
    //this.$audioElement.play();

    // create media element
    const track = this.audioContext.createMediaElementSource(
      this.$audioElement
    );
    track.connect(this.audioContext.destination);

    // Analyzer node
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = FFTSIZE;  //128;  // Number of Stripes
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

    // Colors used for plotting
    const MATTE_BLACK = '#1A202C';
    const WHITE = '#FFFFFF';

    // The function which will get called on each repaint
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



  
  // BUTTONS
  public resetAnim() {
    this.$audioElement.load();
  }

  public playAnim() {
    this.$audioElement.play();
  }

  public pauseAnim() {
    this.$audioElement.pause();
  }

}