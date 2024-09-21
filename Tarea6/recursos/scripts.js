var cajadatos, bd;

// Función principal que se ejecuta cuando se carga la página
function iniciar() {
    cajadatos = document.getElementById("cajadatos");

    // Evento para seleccionar archivos desde el input
    var archivos = document.getElementById("archivos");
    archivos.addEventListener("change", procesar);

    // Intenta abrir la base de datos IndexedDB
    var solicitud = indexedDB.open("basededatos");

    // Maneja los posibles errores al abrir la base de datos
    solicitud.addEventListener("error", mostrarerror);

    // Si la base de datos se abre con éxito, continúa con el programa
    solicitud.addEventListener("success", comenzar);

    // Si la base de datos necesita ser creada o actualizada
    solicitud.addEventListener("upgradeneeded", crearbd);

}

function mostrarerror(evento) {
    alert("Error: " + evento.code + " " + evento.message);
}

function procesar(evento) {
    var archivos = evento.target.files; //Obtiene el archivo del input
    var archivo = archivos[0];
    procesarArchivo(archivo);
}

function procesarArchivo(archivo) {
    var tipo = archivo.type;

    // Identifica el tipo MIME del archivo
    if (tipo === "text/xml" || tipo === "application/xml") {
        cargarXML(archivo);
    } else if (tipo.startsWith("text/")) {
        leerTexto(archivo);
    } else {
        cajadatos.innerHTML = "Tipo de archivo no soportado";
    }
}

// Lee el archivo 
function leerTexto(archivo) {
    var lector = new FileReader();
    lector.addEventListener("load", function (evento) {
        var resultado = evento.target.result;
        cajadatos.innerHTML = "<pre>" + resultado + "</pre>";
    });
    lector.readAsText(archivo);
}

// Carga y procesa el archivo XML
function cargarXML(archivo) {
    var lector = new FileReader();
    lector.addEventListener("load", mostrarXML);
    lector.readAsText(archivo);
}

// Convierte el archivo XML en un objeto DOM y lo almacena en IndexedDB
function mostrarXML(evento) {
    var resultado = evento.target.result;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(resultado, "text/xml");
    // Llama a la función para agregar los datos a IndexedDB
    agregarObjeto(xmlDoc);
}

// Se ejecuta cuando la base de datos se abre con éxito
function comenzar(evento) {
    bd = evento.target.result;
    mostrar();
}

//Creamos la base de datos
function crearbd(evento) {
    var basededatos = evento.target.result;
    console.log("OTRA COSA");
    basededatos.createObjectStore("albums", {
        keyPath: "id",
    });
}

// Almacena los datos extraídos del XML
function agregarObjeto(xmlDoc) {
    var albums = xmlDoc.getElementsByTagName("album");
    console.log(bd);

    // Inicia una transacción de escritura en la base de datos
    var transaccion = bd.transaction(["albums"], "readwrite");

    // Obtiene el almacén de objetos 'albums' de la base de datos
    var almacen = transaccion.objectStore("albums");

    // Itera sobre cada álbum en el XML y agrega sus valores al almacén
    for (var i = 0; i < albums.length; i++) {
        var artist = albums[i].getElementsByTagName("artist")[0].textContent;
        var title = albums[i].getElementsByTagName("title")[0].textContent;
        var songs = albums[i].getElementsByTagName("songs")[0].textContent;
        var year = albums[i].getElementsByTagName("year")[0].textContent;
        var genre = albums[i].getElementsByTagName("genre")[0].textContent;

        // Agrega el nuevo objeto al almacén
        almacen.add({
            id: i + 1,
            artist: artist,
            title: title,
            songs: songs,
            year: year,
            genre: genre,
        });
    }
    // Escucha cuando la transacción se complete para mostrar la lista de albums
    transaccion.addEventListener("complete", mostrar);

    console.log("Datos: ", almacen);
}

// Muestra los datos almacenados en IndexedDB
function mostrar() {
    console.log("MOSTRAR SOLAMENTE");
    cajadatos.innerHTML = "";

    // Inicia una transacción de solo lectura en el almacén 'albums'
    var transaccion = bd.transaction(["albums"], "readonly");

    // Obtiene el almacén de objetos 'albums' de la base de datos
    var almacen = transaccion.objectStore("albums");

    var puntero = almacen.openCursor(null);

    puntero.addEventListener("success", mostrarlista);
}

// Muestra cada álbum en el 'cajadatos'
function mostrarlista(evento) {
  console.log("MOSTRAR LISTA");
  var puntero = evento.target.result;
  // Crear un contenedor para la lista si no existe
  if (!cajadatos.querySelector('ul')) {
      cajadatos.innerHTML = "<ul id='listaDatos'></ul>"; // Inicializa la lista
  }

  var listaDatos = document.getElementById('listaDatos');

  if (puntero) {
      // Agregar un nuevo elemento a la lista
      listaDatos.innerHTML +=
          "<li>" +
          "Álbum: " + puntero.value.id + "<b> | </b>" +
          "Artista: " +puntero.value.artist + "<b> | </b>" +
          "Título: " + puntero.value.title + "<b> | </b>" +
          "# canciones: " + puntero.value.songs + "<b> | </b>" +
          "Año: " + puntero.value.year + "<b> | </b>" +
          "Género: " + puntero.value.genre +
          "</li>";
      puntero.continue();
  }
}


// Inicializa el sistema cuando se carga la página
window.addEventListener("load", iniciar);
