const URL = "https://teachablemachine.withgoogle.com/models/1o5pe2PYG/";
let model, webcam, labelContainer, maxPredictions;

// 初始化攝像頭
async function initCamera() {
    const videoElement = document.getElementById('video');

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        let selectedDeviceId;

        // 遍歷設備，選擇後置攝像頭
        devices.forEach(device => {
            if (device.kind === 'videoinput') {
                if (device.label.toLowerCase().includes('back')) {
                    selectedDeviceId = device.deviceId;
                }
            }
        });

        // 如果沒有找到後置攝像頭，則選擇第一個可用的攝像頭
        if (!selectedDeviceId) {
            const frontCamera = devices.find(device => device.kind === 'videoinput');
            if (frontCamera) selectedDeviceId = frontCamera.deviceId;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }
        });

        videoElement.srcObject = stream;
    } catch (error) {
        console.error('獲取攝像頭失敗:', error);
    }
}

// 初始化模型和設置攝像頭
async function init() {
    document.getElementById('webcam-container').innerHTML = '';
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // 加載模型和元數據
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // 設置攝像頭
    webcam = new tmImage.Webcam(200, 200, false); // 寬度、高度、翻轉
    await webcam.setup(); // 請求訪問攝像頭
    await webcam.play();
    window.requestAnimationFrame(loop);

    // 將畫布添加到 DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div")); // 添加類別標籤
    }
}

async function uploadImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    if (!file) {
        alert('請選擇一張圖片！');
        return;
    }

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 進行預測
        const prediction = await model.predict(canvas);
        displayPrediction(prediction);
    };

    document.getElementById('imageContainer').innerHTML = ''; // 清空之前的圖片
    document.getElementById('imageContainer').appendChild(img);
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
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction; // 顯示預測結果
    }
}

// 顯示預測結果的函數
function displayPrediction(prediction) {
    const labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = ''; // 清空之前的預測結果

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.appendChild(document.createElement('div')).innerHTML = classPrediction; // 顯示預測結果
    }
}

// 切換顯示分頁
function showPage(pageId) {
    const pages = document.querySelectorAll('.container');
    pages.forEach(page => {
        page.classList.remove('active'); // 隱藏所有分頁
    });
    document.getElementById(pageId).classList.add('active'); // 顯示選擇的分頁
}

// 初始化應用
window.onload = async () => {
    await initCamera();
};

async function stopCamera() {
    webcam.pause();
}

async function changeCamera() {
    // 切換攝像頭的邏輯可以在這裡實現
    stopcam();
    // 重新初始化攝像頭
    await init();
}

async function startCamera() {
    await init();
}