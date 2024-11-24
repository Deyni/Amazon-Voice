let isRecordingAudio = false;
let isRecordingVideo = false;
let mediaRecorder;
let audioChunks = [];
let videoStream;
let videoRecorder;
let capturedPhotoLink = "";

// comando de voz
document.getElementById('voice-command-btn').addEventListener('click', startVoiceRecognition);

// reconhecimento de voz em português
function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    recognition.start();

    recognition.onresult = function (event) {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("Comando:", command);

        if (command.includes("equipamento")) {
            transcribeAudioToField("equipamento");
        } else if (command.includes("descrição da infração")) {
            transcribeAudioToField("descricao");
        } else if (command.includes("gerar relatório")) {
            generateReport();
        } else if (command.includes("ativar câmera")) {
            captureVideo();
        } else if (command.includes("parar câmera")) {
            stopVideoRecording();
        } else if (command.includes("ativar áudio")) {
            recordAudio();
        } else if (command.includes("parar áudio")) {
            stopAudioRecording();
        } else if (command.includes("registrar localização")) {
            getLocation();
        } else {
            alert("Comando não reconhecido.");
        }
    };

    recognition.onerror = function (event) {
        console.error("Erro de reconhecimento de voz:", event.error);
    };
}

// transcreve o áudio para o campo de texto
function transcribeAudioToField(field) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    recognition.start();

    recognition.onresult = function (event) {
        const transcription = event.results[0][0].transcript;
        if (field === "equipamento") {
            document.getElementById("equipamento").value = transcription;
        } else if (field === "descricao") {
            document.getElementById("descricao").value = transcription;
        }
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} transcrito: ${transcription}`);
    };

    recognition.onerror = function (event) {
        console.error("Erro de transcrição de áudio:", event.error);
    };
}

// captura o vídeo
document.getElementById('capture-video').addEventListener('click', captureVideo);

async function captureVideo() {
    if (isRecordingVideo) {
        alert("Câmera já está ativa.");
        return;
    }

    isRecordingVideo = true;
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const videoElement = document.createElement('video');
    videoElement.srcObject = videoStream;
    videoElement.play();
    videoElement.width = 320;
    videoElement.height = 240;

    document.getElementById('video-container').appendChild(videoElement);

    videoRecorder = new MediaRecorder(videoStream);
    videoRecorder.start();

    videoRecorder.ondataavailable = (event) => {
        const videoBlob = event.data;
        const videoUrl = URL.createObjectURL(videoBlob);
        document.getElementById('captured-data').innerText += 'Arquivo capturado.\n';

        const downloadLink = document.createElement('a');
        downloadLink.href = videoUrl;
        downloadLink.download = 'video_gravado.mp4';
        downloadLink.textContent = 'Baixar arquivo';

        document.getElementById('video-container').appendChild(downloadLink);
    };

    videoRecorder.onstop = () => {
        videoStream.getTracks().forEach(track => track.stop());
        isRecordingVideo = false;
    };
}

// para a gravação
function stopVideoRecording() {
    if (isRecordingVideo) {
        videoRecorder.stop();
        document.getElementById('captured-data').innerText += 'Câmera Desativada.\n';
    } else {
        alert("Câmera não capturou nada.");
    }
}

// grava áudio
document.getElementById('record-audio').addEventListener('click', recordAudio);

async function recordAudio() {
    if (!isRecordingAudio) {
        isRecordingAudio = true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            document.getElementById('captured-data').innerText += 'Áudio gravado.\n';

            const downloadLink = document.createElement('a');
            downloadLink.href = audioUrl;
            downloadLink.download = 'audio_gravado.wav';
            downloadLink.textContent = 'Baixar áudio';

            const audioContainer = document.createElement('div');
            audioContainer.style.display = 'flex';
            audioContainer.style.alignItems = 'center';
            audioContainer.appendChild(downloadLink);
            document.getElementById('video-container').appendChild(audioContainer);
        };
    } else {
        isRecordingAudio = false;
        mediaRecorder.stop();
    }
}

// para a gravação de áudio
function stopAudioRecording() {
    if (isRecordingAudio) {
        mediaRecorder.stop();
        document.getElementById('captured-data').innerText += 'Gravação de áudio parada.\n';
    } else {
        alert("Áudio não está sendo gravado.");
    }
}

// pega a localização
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById('coordenadas').value = `${position.coords.latitude}, ${position.coords.longitude}`;
            document.getElementById('captured-data').innerText += `Coordenadas capturadas: ${position.coords.latitude}, ${position.coords.longitude}\n`;
        });
    } else {
        alert("Geolocalização não suportada pelo navegador.");
    }
}

// gera relatório
function generateReport() {
    getLocation(); // pega as coordenadas geográficas antes de gerar o relatório
    setTimeout(() => {
        const data = new Date().toLocaleString();
        const coordenadas = document.getElementById('coordenadas').value;
        const equipamento = document.getElementById('equipamento').value;
        const descricao = document.getElementById('descricao').value;

        const reportData = 
        `Data/Hora: ${data}
         Equipamento: ${equipamento}
         Descrição da Infração: ${descricao}
         Foto capturada: ${capturedPhotoLink}
        `;
        alert("Relatório gerado com sucesso!");
        document.getElementById('captured-data').innerText += reportData;
    }, 10000); // aqui coloquei 10 segundos para dar tempo do usuário permitir compartilhar a localização
}
