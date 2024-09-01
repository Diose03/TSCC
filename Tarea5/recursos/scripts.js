// Clase Logo que maneja el dibujo en el canvas
class Logo {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
    }

    // Método para obtener un color aleatorio(con ayuda de chatGPT)
    obtenerColorAleatorio() {
        const codigo = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += codigo[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Método para limpiar el canvas antes de volver a dibujar circulos sobre él.
    limpiarCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Método para dibujar un círculo 
    dibujarCirculo(x, y, radio, colorInterior, colorBorde) {
        let gradienteRadial = this.context.createRadialGradient(x, y, radio / 2, x, y, radio);
        gradienteRadial.addColorStop(0, colorInterior);
        gradienteRadial.addColorStop(1, colorBorde);

        this.context.beginPath();
        this.context.arc(x, y, radio, 0, 2 * Math.PI);
        this.context.fillStyle = gradienteRadial;
        this.context.fill();
    }

// Posicionar los tres círculos sobre el rectángulo, creando así el logo completo
dibujarLogo() {
    this.limpiarCanvas();

    // Crear un gradiente para el rectángulo
    let gradiente = this.context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradiente.addColorStop(0.27, "#0e11cf");
    gradiente.addColorStop(0.43, "#520699");
    gradiente.addColorStop(1, "#ffe798");
    this.context.fillStyle = gradiente;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar tres círculos en posiciones aleatorias
    for (let i = 0; i < 3; i++) {
        let posicionX = Math.random() * (this.canvas.width - 40) + 20; 
        let posicionY = Math.random() * (this.canvas.height - 40) + 20; 
        let radio = Math.random() * 30 + 10;
        let colorInterior = this.obtenerColorAleatorio();
        let colorBorde = this.obtenerColorAleatorio();
        this.dibujarCirculo(posicionX, posicionY, radio, colorInterior, colorBorde);
    }
}

}

let maximo, medio, reproducir, barra, progreso, silenciar, volumen, bucle, tiempoActual, tracks, audio, botonCambiarColor, logo;

function iniciar() {
    // Inicializar el objeto Logo
    logo = new Logo('canvas');
    logo.dibujarLogo(); // Dibuja el logo inicial 
    maximo = 365;
    medio = document.getElementById("medio");
    reproducir = document.getElementById("reproducir");
    audio = document.getElementById("audio");
    barra = document.getElementById("barra");
    progreso = document.getElementById("progreso");
    silenciar = document.getElementById("silenciar");
    volumen = document.getElementById("volumen");
    tiempoActual = document.getElementById("tiempoAct");
    tracks = medio.textTracks;
    botonCambiarColor = document.getElementById("cambiarColor");

    for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'disabled';
    }
    reproducir.addEventListener("click", presionar);
    silenciar.addEventListener("click", sonido);
    barra.addEventListener("click", mover);
    volumen.addEventListener("change", nivel);
    botonCambiarColor.addEventListener("click", cambiarColorLogo);
}



/* Avance en la barra de progreso del video*/
function estado() {
    if (!medio.ended) {
        var largo = parseInt(medio.currentTime * maximo / medio.duration);
        progreso.style.width = largo + "px";
        tiempoActual.textContent = medio.currentTime.toFixed(2);
    } else {
        progreso.style.width = "0px";
        reproducir.value = ">";
        tiempoActual.textContent = "0";
    }
}

function actualizarEstado() {
    estado();
    if (!medio.ended) {
        bucle = requestAnimationFrame(actualizarEstado);
    }
}

/*Para los cambios en el botón de reproducir y pausar */
function presionar() {
    if (!medio.paused && !medio.ended) {
        medio.pause();
        audio.pause(); 
        reproducir.value = ">";
        cancelAnimationFrame(bucle);
    } else {
        medio.play();
        audio.play(); 
        reproducir.value = "||";
        actualizarEstado(); 
    }
}

/*Para el tiempo de reproducción del video basado en la barra de progreso*/
function mover(evento) {
    if (!medio.paused && !medio.ended) {
        var ratonX = evento.offsetX - 2;
        if (ratonX < 0) {
            ratonX = 0;
        } else if (ratonX > maximo) {
            ratonX = maximo;
        }
        var tiempo = ratonX * medio.duration / maximo;
        medio.currentTime = tiempo;
        audio.currentTime = tiempo;
        progreso.style.width = ratonX + "px";
    }
}

/* Alterna entre activar y desactivar el sonido*/
function sonido() {
    if (silenciar.value == "Silencio") {
        medio.muted = true;
        audio.muted = true;
        silenciar.value = "Sonido";
    } else {
        medio.muted = false;
        audio.muted = false;
        silenciar.value = "Silencio";
    }
}

/*Barra de volumen */
function nivel() {
    medio.volume = volumen.value;
    audio.volume = volumen.value;
}

/* Para redibujar el logo si el video no esta pausado y no está finalizado */
function cambiarColorLogo() {
    if (!medio.paused && !medio.ended) {
        logo.dibujarLogo(); // Redibuja el logo con colores aleatorios
    }
}

window.addEventListener("load", iniciar);
