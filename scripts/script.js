async function identifyPart() {
    const fileInput = document.getElementById('upload');
    const resultDiv = document.getElementById('result');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            // 將上傳的圖片轉換為畫布
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            // 使用 Teachable Machine 進行預測
            const modelURL = "https://teachablemachine.withgoogle.com/models/rByXY4DbW/model.json"; // 替換為您的模型路徑
            const metadataURL = "https://teachablemachine.withgoogle.com/models/rByXY4DbW/metadata.json"; // 替換為您的元數據路徑
            const model = await tmImage.load(modelURL, metadataURL);
            const prediction = await model.predict(canvas);

            // 顯示識別結果
            let resultText = "";
            prediction.forEach((pred) => {
                resultText += `${pred.className}: ${pred.probability.toFixed(2)}<br>`;
            });
            resultDiv.innerHTML = '識別結果：<br>' + resultText;
        };
    } else {
        resultDiv.innerHTML = '請上傳圖片。';
    }
}

function startAR() {
    alert('啟動AR功能，這裡可以加入AR邏輯。');
    // 這裡可以整合AR技術，例如AR.js
}