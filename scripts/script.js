// Teachable Machine 模型 URL
const URL = "https://teachablemachine.withgoogle.com/models/6aRa8wpAK/";

let model, webcam, labelContainer, maxPredictions;

// 初始化模型和攝像頭
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; // 是否翻轉攝像頭
    cam = new tmImagwebe.Webcam(200, 200, flip); // 設定攝像頭大小
    await webcam.setup(); // 請求攝像頭訪問權限
    await webcam.play();
    window.requestAnimationFrame(loop);

    // 將攝像頭畫布添加到 DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // 更新攝像頭畫面
    await predict();
    window.requestAnimationFrame(loop);
}

// 將攝像頭畫面傳遞到模型進行預測
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
