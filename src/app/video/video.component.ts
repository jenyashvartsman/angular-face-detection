import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    this.startVideo();
  }

  startVideo(): void {
    const video: any = document.getElementById('video');

    this.loadModels();
    this.setVideoStream(video);

    video.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.getElementById('videoWrapper').append(canvas);
      const displaySize = {width: video.width, height: video.height};
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => this.handleFaceDetection(video, canvas, displaySize), 100);
    });
  }

  loadModels(): void {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'), // mouth, eyes, nose ...
      faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'), // face box
      faceapi.nets.faceExpressionNet.loadFromUri('assets/models') // happy, sad ...
    ]);
  }

  setVideoStream(video: any): void {
    navigator.getUserMedia(
      {video: {}},
      stream => video.srcObject = stream,
      error => console.error(error)
    );
  }

  async handleFaceDetection(video: any, canvas: any, displaySize: any): Promise<void> {
    const detection: any[] = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detection, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }
}
