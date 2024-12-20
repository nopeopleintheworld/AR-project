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
            const modelURL = "https://teachablemachine.withgoogle.com/models/rByXY4DbW/model.json";
            const metadataURL = "https://teachablemachine.withgoogle.com/models/rByXY4DbW/metadata.json";
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
    const arContainer = document.getElementById('ar-container');
    arContainer.innerHTML = `
        <a-scene embedded arjs>
            <a-marker preset="hiro">
                <a-box position='0 0.5 0' material='color: yellow;'></a-box>
            </a-marker>
            <a-entity camera></a-entity>
        </a-scene>
    `;
    alert('AR功能已啟動！');
}