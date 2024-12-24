// 全局變量聲明
let storage;
const firebaseConfig = {
    apiKey: "AIzaSyADRjya5_yDXdmODky4cnvj0obvPKcfDOA",
    authDomain: "flu-andy.firebaseapp.com",
    projectId: "flu-andy",
    storageBucket: "flu-andy.appspot.com",
    messagingSenderId: "1025758966761",
    appId: "1:1025758966761:web:1fa9524627df5583345178",
};

// 初始化 Firebase
try {
    firebase.initializeApp(firebaseConfig);
    storage = firebase.storage();
    console.log('Firebase Storage initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const URL = "https://teachablemachine.withgoogle.com/models/1o5pe2PYG/";
let model, webcam, labelContainer, maxPredictions;

// 添加一個全局變量來追踪攝像頭狀態
let isRunning = false;

// 初始化攝像頭
async function initCamera() {
    const videoElement = document.getElementById('video');
    
    // Add check for video element
    if (!videoElement) {
        console.error('Video element not found');
        return;
    }

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

        // 如果沒有找到後置攝像頭，則選第一個可用的攝像頭
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

// 初始化型
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Model loading error:', error);
    }
}

// 初始化模型和設置攝像頭
async function init() {
    isRunning = true;
    
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = '';
    }

    // 加載模型和元數據
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();

    try {
        // 獲取所有可用的視頻輸入設備
        const devices = await navigator.mediaDevices.enumerateDevices();
        let selectedDeviceId;

        // 尋找後置攝像頭
        for (const device of devices) {
            if (device.kind === 'videoinput') {
                if (device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('後') || 
                    device.label.toLowerCase().includes('rear')) {
                    selectedDeviceId = device.deviceId;
                    break;
                }
            }
        }

        // 如果沒有找到後置攝像頭，使用第一個可用的攝像頭
        if (!selectedDeviceId) {
            const frontCamera = devices.find(device => device.kind === 'videoinput');
            if (frontCamera) selectedDeviceId = frontCamera.deviceId;
        }

        // 設置攝像頭
        webcam = new tmImage.Webcam(400, 400, false); // 不翻轉
        await webcam.setup({
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: selectedDeviceId ? undefined : 'environment'
        });
        await webcam.play();

        // 設置 webcam canvas 的樣式
        webcam.canvas.style.maxWidth = '100%';
        webcam.canvas.style.height = 'auto';
        
        // 將畫布添加到 result 區域
        if (resultDiv) {
            resultDiv.appendChild(webcam.canvas);
            webcam.canvas.style.display = 'block';
            webcam.canvas.style.margin = 'auto';
        }

        // 設置標籤容器
        labelContainer = document.getElementById("label-container");
        if (labelContainer) {
            labelContainer.innerHTML = '';
            for (let i = 0; i < maxPredictions; i++) {
                labelContainer.appendChild(document.createElement("div"));
            }
        }

        // 開始預測循環
        window.requestAnimationFrame(loop);

    } catch (error) {
        console.error('Camera initialization error:', error);
        alert('無法啟動攝像頭，請確保已授予權限');
    }
}

async function uploadImage() {
    // 先停止攝像頭
    await stopCamera();
    // 重置模型
    await loadModel();

    // 清理標籤容器
    const labelContainer = document.getElementById('label-container');
    if (labelContainer) {
        labelContainer.innerHTML = '';
    }

    // 確保模型已加載
    if (!model) {
        alert('模型尚未加載完成，請稍後再試');
        return;
    }

    const fileInput = document.getElementById('imageUpload');
    const resultDiv = document.getElementById('result');
    
    if (!fileInput || !resultDiv) {
        console.error('Required elements not found');
        return;
    }

    const file = fileInput.files[0];
    if (!file) {
        alert('請選取一張圖片！');
        return;
    }

    try {
        resultDiv.innerHTML = '處理中...';

        const img = document.createElement('img');
        img.src = window.URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        img.onload = async () => {
            try {
                resultDiv.innerHTML = '';
                resultDiv.appendChild(img);
                const prediction = await model.predict(img);
                displayPrediction(prediction);
            } catch (error) {
                console.error('預測錯誤:', error);
                alert('識別過程中發生錯誤');
                resultDiv.innerHTML = '預測失敗';
            }
        };

    } catch (error) {
        console.error('處理錯誤:', error);
        alert('處理圖片時發生錯誤');
        resultDiv.innerHTML = '處理失敗';
    }
}

async function loop() {
    if (!isRunning) return;  // 如果不在運行狀態，停止循環
    
    webcam.update();
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
    labelContainer.innerHTML = '<h3>識別結果：</h3>';

    prediction.sort((a, b) => b.probability - a.probability); // Sort by probability

    for (let i = 0; i < prediction.length; i++) {
        const probability = (prediction[i].probability * 100).toFixed(2);
        const div = document.createElement('div');
        div.style.margin = '10px 0';
        div.style.padding = '5px';
        div.style.backgroundColor = i === 0 ? '#e8f5e9' : 'transparent';
        div.innerHTML = `${prediction[i].className}: ${probability}%`;
        labelContainer.appendChild(div);
    }
}

// 切換顯示分頁
function showPage (pageId) {
    const pages = document.querySelectorAll('.container');
    pages.forEach(page => {
        page.classList.remove('active'); // 隱藏所有分頁
    });
    document.getElementById(pageId).classList.add('active'); // 顯示選擇的分頁
}

// 初始化應用
window.onload = async () => {
    // 只加載模型，不自動啟動攝像頭
    await loadModel();
};

async function stopCamera() {
    isRunning = false;  // 停止循環
    
    if (!webcam) {
        console.log('Webcam is not initialized');
        return;
    }
    
    try {
        webcam.pause();
        
        // 停止所有視頻流
        const videoElement = document.getElementById('video');
        if (videoElement && videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    } catch (error) {
        console.error('Error stopping camera:', error);
    }
}

async function changeCamera() {
    try {
        await stopCamera();     // 先停止當前攝像頭
        await loadModel();      // 重置模型
        await init();           // 重新初始化攝像頭
    } catch (error) {
        console.error('Error changing camera:', error);
    }
}

async function startCamera() {
    try {
        // 重置模型
        await loadModel();
        
        // 清理 result 區域
        const result = document.getElementById('result');
        if (result) {
            result.innerHTML = '';
        }
        
        // 初始化攝像頭
        await init();
    } catch (error) {
        console.error('Error starting camera:', error);
    }
}