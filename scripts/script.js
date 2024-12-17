function identifyPart() {
    const fileInput = document.getElementById('upload');
    const resultDiv = document.getElementById('result');
    if (fileInput.files.length > 0) {
    // 這裡可以添加AI識別的邏輯
        resultDiv.innerHTML = '識別結果：這裡顯示零件名稱和信息。';
    } else {
        resultDiv.innerHTML = '請上傳圖片。';
            }
}

function startAR() {
    alert('啟動AR功能，這裡可以加入AR邏輯。');
    // 這裡可以整合AR技術，例如AR.js
}