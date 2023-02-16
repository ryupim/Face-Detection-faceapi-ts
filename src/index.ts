import * as faceapi from "face-api.js";

const video: HTMLVideoElement = document.getElementById(
    "video"
) as HTMLVideoElement;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("models"),
    faceapi.nets.faceExpressionNet.loadFromUri("models"),
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.error(err);
        });
}

video.addEventListener("play", () => {
    const canvas: HTMLCanvasElement = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    console.log("displaySize", displaySize);
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        console.log(detections);
        const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
        );
        const ctx = canvas.getContext("2d");
        if (ctx !== null) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
    }, 100);
});
