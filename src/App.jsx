import { useState, useEffect, useRef } from "react";
import "./App.css";

const preguntas = [
  { pregunta: "¿En qué año llegó Hernán Cortés a las costas de México?", opciones: ["1492", "1519", "1521", "1535"], correcta: 1 },
  { pregunta: "¿Cómo se llamaba la capital del Imperio mexica?", opciones: ["Tlaxcala", "Texcoco", "Tenochtitlan", "Cholula"], correcta: 2 },
  { pregunta: "¿Quién era el gobernante mexica cuando llegaron los españoles?", opciones: ["Cuauhtémoc", "Moctezuma II", "Cuitláhuac", "Nezahualcóyotl"], correcta: 1 },
  { pregunta: "¿Qué pueblo indígena fue un importante aliado de los españoles?", opciones: ["Mexicas", "Mayas", "Purépechas", "Tlaxcaltecas"], correcta: 3 },
  { pregunta: "¿Qué animal trajeron los españoles que causó gran impresión?", opciones: ["Camello", "Caballo", "Elefante", "Búfalo"], correcta: 1 },
  { pregunta: "¿Quién fue el último tlatoani mexica?", opciones: ["Moctezuma II", "Cuitláhuac", "Cuauhtémoc", "Axayácatl"], correcta: 2 },
  { pregunta: "¿En qué año cayó Tenochtitlan?", opciones: ["1519", "1520", "1521", "1530"], correcta: 2 },
];

const cartasJugador = [
  { id: "curandero", nombre: "Curandero", accion: "curar", descripcion: "Recupera 4 puntos de vida", emoji: "🌿" },
  { id: "jaguar", nombre: "Guerrero Jaguar", accion: "atacar", descripcion: "Inflige 5 puntos de daño", emoji: "🐆" },
  { id: "aguila", nombre: "Guerrero Águila", accion: "defender", descripcion: "Bloquea el ataque enemigo", emoji: "🦅" },
];

const cartasCPU = [
  { id: "sacerdote", nombre: "Sacerdote", accion: "curar", descripcion: "Recupera 4 puntos de vida", emoji: "⛪" },
  { id: "caballeria", nombre: "Caballería", accion: "atacar", descripcion: "Inflige 5 puntos de daño", emoji: "🐴" },
  { id: "rodelero", nombre: "Rodelero", accion: "defender", descripcion: "Bloquea el ataque enemigo", emoji: "🛡️" },
];

function calcularResultado(accionJugador, accionCPU) {
  if (accionJugador === "atacar" && accionCPU === "curar") return { danoJugador: 0, danoCPU: 5, msg: "¡Interrumpiste la curación enemiga!" };
  if (accionJugador === "atacar" && accionCPU === "atacar") return { danoJugador: 5, danoCPU: 5, msg: "¡Ambos atacaron!" };
  if (accionJugador === "atacar" && accionCPU === "defender") return { danoJugador: 0, danoCPU: 0, msg: "El Rodelero bloqueó tu ataque." };
  if (accionJugador === "defender" && accionCPU === "atacar") return { danoJugador: 0, danoCPU: 0, msg: "¡El Guerrero Águila bloqueó el ataque!" };
  if (accionJugador === "defender" && accionCPU === "curar") return { danoJugador: 0, danoCPU: 0, msg: "Ambos descansaron." };
  if (accionJugador === "defender" && accionCPU === "defender") return { danoJugador: 0, danoCPU: 0, msg: "Ambos se defendieron." };
  if (accionJugador === "curar" && accionCPU === "atacar") return { danoJugador: 5, danoCPU: 0, msg: "¡Te atacaron mientras curabas!" };
  if (accionJugador === "curar" && accionCPU === "curar") return { danoJugador: -4, danoCPU: -4, msg: "Ambos se curaron." };
  if (accionJugador === "curar" && accionCPU === "defender") return { danoJugador: -4, danoCPU: 0, msg: "¡Te curaste sin interrupciones!" };
  return { danoJugador: 0, danoCPU: 0, msg: "" };
}

function elegirCartaCPU(dificultad, enfriamientoCPU, ultimaAccionJugador) {
  const disponibles = cartasCPU.filter(c => !enfriamientoCPU[c.id] || enfriamientoCPU[c.id] <= 0);
  if (disponibles.length === 0) return cartasCPU[Math.floor(Math.random() * cartasCPU.length)];
  if (dificultad === "facil") {
  if (Math.random() > 0.8) {
    if (ultimaAccionJugador === "atacar") return disponibles.find(c => c.accion === "defender") || disponibles[Math.floor(Math.random() * disponibles.length)];
    if (ultimaAccionJugador === "curar") return disponibles.find(c => c.accion === "atacar") || disponibles[Math.floor(Math.random() * disponibles.length)];
  }
  return disponibles[Math.floor(Math.random() * disponibles.length)];
} 
  if (dificultad === "medio" && Math.random() > 0.4) return disponibles[Math.floor(Math.random() * disponibles.length)];
  if (ultimaAccionJugador === "atacar") return disponibles.find(c => c.accion === "defender") || disponibles[0];
  if (ultimaAccionJugador === "curar") return disponibles.find(c => c.accion === "atacar") || disponibles[0];
  if (ultimaAccionJugador === "defender") return disponibles.find(c => c.accion === "curar") || disponibles[0];
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

export default function App() {
  const [pantalla, setPantalla] = useState("menu");
  const [dificultad, setDificultad] = useState(null);
  const [vidaJugador, setVidaJugador] = useState(30);
  const [vidaCPU, setVidaCPU] = useState(30);
  const [enfriamientoJugador, setEnfriamientoJugador] = useState({});
  const [enfriamientoCPU, setEnfriamientoCPU] = useState({});
  const [ronda, setRonda] = useState(1);
  const [ultimaAccionJugador, setUltimaAccionJugador] = useState(null);
  const [comodin, setComodin] = useState(null);
  const [esperandoComodin, setEsperandoComodin] = useState(false);
  const [eligiendoDescongelar, setEligiendoDescongelar] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [tiempoComodin, setTiempoComodin] = useState(5);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [resultado, setResultado] = useState(null);
  const timerRef = useRef(null);
  const timerComodinRef = useRef(null);
  const preguntasUsadas = useRef([]);

  const tiempoPorDificultad = { facil: 7, medio: 5, dificil: 3 };

  useEffect(() => {
    if (pantalla === "juego" && !esperandoComodin && !resultado) {
      setTiempo(tiempoPorDificultad[dificultad]);
      timerRef.current = setInterval(() => {
        setTiempo(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            const disponible = cartasJugador.find(c => !enfriamientoJugador[c.id] || enfriamientoJugador[c.id] <= 0);
            if (disponible) jugarCarta(disponible, true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [pantalla, ronda, esperandoComodin, resultado]);

  useEffect(() => {
    if (esperandoComodin && comodin && !comodin.respondido && !eligiendoDescongelar) {
      setTiempoComodin(5);
      timerComodinRef.current = setInterval(() => {
        setTiempoComodin(t => {
          if (t <= 1) {
            clearInterval(timerComodinRef.current);
            setComodin(c => ({ ...c, respondido: true, correcto: false, opcionElegida: 99 }));
            setTimeout(() => {
              setEsperandoComodin(false);
              setComodin(null);
              setResultado(null);
            }, 1500);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerComodinRef.current);
  }, [esperandoComodin, comodin?.pregunta]);

  function iniciarJuego(nivel) {
    setDificultad(nivel);
    setPantalla("instrucciones");
  }

  function empezarBatalla() {
    setVidaJugador(30);
    setVidaCPU(30);
    setEnfriamientoJugador({});
    setEnfriamientoCPU({});
    setRonda(1);
    setUltimaAccionJugador(null);
    setComodin(null);
    setEsperandoComodin(false);
    setEligiendoDescongelar(false);
    setResultado(null);
    setCartaSeleccionada(null);
    preguntasUsadas.current = [];
    setPantalla("juego");
  }

  function jugarCarta(carta, automatico = false) {
    if (enfriamientoJugador[carta.id] > 0) return;
    clearInterval(timerRef.current);
    setCartaSeleccionada(carta);

    const cartaCPU = elegirCartaCPU(dificultad, enfriamientoCPU, ultimaAccionJugador);
    const res = calcularResultado(carta.accion, cartaCPU.accion);

    const nuevaVidaJugador = Math.min(30, Math.max(0, vidaJugador - res.danoJugador));
    const nuevaVidaCPU = Math.min(30, Math.max(0, vidaCPU - res.danoCPU));

    const nuevoEnfJugador = { ...enfriamientoJugador };
    Object.keys(nuevoEnfJugador).forEach(k => { if (nuevoEnfJugador[k] > 0) nuevoEnfJugador[k]--; });
    nuevoEnfJugador[carta.id] = 2;

    const nuevoEnfCPU = { ...enfriamientoCPU };
    Object.keys(nuevoEnfCPU).forEach(k => { if (nuevoEnfCPU[k] > 0) nuevoEnfCPU[k]--; });
    nuevoEnfCPU[cartaCPU.id] = 2;

    setVidaJugador(nuevaVidaJugador);
    setVidaCPU(nuevaVidaCPU);
    setEnfriamientoJugador(nuevoEnfJugador);
    setEnfriamientoCPU(nuevoEnfCPU);
    setUltimaAccionJugador(carta.accion);
    setResultado({ cartaJugador: carta, cartaCPU, mensaje: res.msg + (automatico ? " (tiempo agotado)" : "") });

    if (nuevaVidaCPU <= 0) { setTimeout(() => setPantalla("victoria"), 1500); return; }
    if (nuevaVidaJugador <= 0) { setTimeout(() => setPantalla("derrota"), 1500); return; }

    const nuevaRonda = ronda + 1;
    setRonda(nuevaRonda);

    if (nuevaRonda % 5 === 0) {
      const disponibles = preguntas.filter((_, i) => !preguntasUsadas.current.includes(i));
      if (disponibles.length > 0) {
        const idx = preguntas.indexOf(disponibles[Math.floor(Math.random() * disponibles.length)]);
        preguntasUsadas.current.push(idx);
        if (preguntasUsadas.current.length === preguntas.length) preguntasUsadas.current = [];
        setTimeout(() => {
          setComodin({ ...preguntas[idx], idx });
          setEsperandoComodin(true);
          setResultado(null);
        }, 1500);
        return;
      }
    }
    setTimeout(() => setResultado(null), 1500);
  }

  function responderComodin(opcionIdx) {
    clearInterval(timerComodinRef.current);
    const correcto = opcionIdx === comodin.correcta;
    setComodin({ ...comodin, respondido: true, correcto, opcionElegida: opcionIdx });
    if (correcto) {
      setTimeout(() => setEligiendoDescongelar(true), 800);
    } else {
      setTimeout(() => {
        setEsperandoComodin(false);
        setComodin(null);
        setResultado(null);
      }, 1500);
    }
  }

  function descongelarGuerrero(cartaId) {
    const nuevoEnf = { ...enfriamientoJugador };
    nuevoEnf[cartaId] = 0;
    setEnfriamientoJugador(nuevoEnf);
    setEligiendoDescongelar(false);
    setEsperandoComodin(false);
    setComodin(null);
    setResultado(null);
  }

  const tiempoMax = tiempoPorDificultad[dificultad] || 5;

  return (
    <div className="app">

      {pantalla === "menu" && (
        <div className="menu">
          <h1 className="titulo-medieval">La Conquista de México</h1>
          <p className="subtitulo">1519 — 1521</p>
          <button className="btn-empezar" onClick={() => setPantalla("dificultad")}>Empezar</button>
        </div>
      )}

      {pantalla === "dificultad" && (
        <div className="menu">
          <h2 className="titulo-medieval">Elige la Dificultad</h2>
          <div className="botones-dificultad">
            <button className="btn-facil" onClick={() => iniciarJuego("facil")}>
              <span className="dif-titulo">🟢 Fácil</span>
              <span className="dif-desc">7 segundos por turno</span>
              <span className="dif-desc">CPU elige al azar</span>
            </button>
            <button className="btn-medio" onClick={() => iniciarJuego("medio")}>
              <span className="dif-titulo">🟡 Medio</span>
              <span className="dif-desc">5 segundos por turno</span>
              <span className="dif-desc">CPU a veces es inteligente</span>
            </button>
            <button className="btn-dificil" onClick={() => iniciarJuego("dificil")}>
              <span className="dif-titulo">🔴 Difícil</span>
              <span className="dif-desc">3 segundos por turno</span>
              <span className="dif-desc">CPU siempre elige lo mejor</span>
            </button>
          </div>
          <button className="btn-volver" onClick={() => setPantalla("menu")}>← Volver</button>
        </div>
      )}

      {pantalla === "instrucciones" && (
        <div className="instrucciones">
          <h2 className="titulo-medieval">Cómo se Juega</h2>
          <div className="reglas">
            <div className="regla">
              <span className="regla-icono">🦅</span>
              <div><strong>Tú eres los Mexicas.</strong> Defiende Tenochtitlan de los conquistadores españoles.</div>
            </div>
            <div className="regla">
              <span className="regla-icono">⚔️</span>
              <div><strong>Cada turno elige un guerrero:</strong> el Jaguar ataca (5 daño), el Águila defiende (bloquea todo), el Curandero cura (recupera 4 vida).</div>
            </div>
            <div className="regla">
              <span className="regla-icono">🔄</span>
              <div><strong>Enfriamiento:</strong> después de usar un guerrero, no puedes volver a usarlo por 1 ronda.</div>
            </div>
            <div className="regla">
              <span className="regla-icono">⏱️</span>
              <div><strong>Tiempo limitado:</strong> tienes {tiempoPorDificultad[dificultad]} segundos para elegir. Si no eliges, se defiende automático.</div>
            </div>
            <div className="regla">
              <span className="regla-icono">🃏</span>
              <div><strong>Preguntas comodín:</strong> cada 5 rondas aparece una pregunta histórica. Tienes 5 segundos para responder. Si contestas bien, <strong>tú eliges qué guerrero descongelar.</strong></div>
            </div>
            <div className="regla">
              <span className="regla-icono">💀</span>
              <div><strong>Gana</strong> quien reduzca la vida del enemigo a 0 primero. Ambos empiezan con 30 de vida.</div>
            </div>
          </div>
          <button className="btn-empezar" onClick={empezarBatalla}>¡A Batalla!</button>
          <button className="btn-volver" onClick={() => setPantalla("dificultad")}>← Volver</button>
        </div>
      )}

      {pantalla === "juego" && !esperandoComodin && (
        <div className="juego">
          <div className="barras-vida">
            <div className="lado-vida">
              <span className="vida-label">🦅 Mexicas</span>
              <span className="vida-num">{vidaJugador}/30</span>
              <div className="barra"><div style={{ width: `${(vidaJugador / 30) * 100}%` }} className="relleno verde" /></div>
            </div>
            <div className="ronda-centro">Ronda {ronda}</div>
            <div className="lado-vida derecho">
              <span className="vida-label">🏰 Españoles</span>
              <span className="vida-num">{vidaCPU}/30</span>
              <div className="barra"><div style={{ width: `${(vidaCPU / 30) * 100}%` }} className="relleno rojo" /></div>
            </div>
          </div>

          <div className="timer-container">
            <div className="timer-barra" style={{ width: `${(tiempo / tiempoMax) * 100}%`, background: tiempo <= 2 ? "#ff2222" : tiempo <= 4 ? "#ffaa00" : "#00cc44" }} />
            <span className="timer-num">{tiempo}s</span>
          </div>

          {resultado && (
            <div className="resultado-turno">
              <div className="cartas-resultado">
                <div className="carta-resultado">
                  <div className="carta-emoji">{resultado.cartaJugador.emoji}</div>
                  <div className="carta-nombre-res">{resultado.cartaJugador.nombre}</div>
                </div>
                <div className="vs-texto">VS</div>
                <div className="carta-resultado">
                  <div className="carta-emoji">{resultado.cartaCPU.emoji}</div>
                  <div className="carta-nombre-res">{resultado.cartaCPU.nombre}</div>
                </div>
              </div>
              <div className="mensaje-resultado">{resultado.mensaje}</div>
            </div>
          )}

          {!resultado && (
            <div className="mensaje-turno">Elige tu guerrero</div>
          )}

          <div className="cartas-jugador">
            {cartasJugador.map(carta => {
              const enf = enfriamientoJugador[carta.id] || 0;
              const bloqueada = enf > 0;
              return (
                <div
                  key={carta.id}
                  className={`carta-juego ${bloqueada ? "bloqueada" : ""} ${cartaSeleccionada?.id === carta.id && resultado ? "seleccionada" : ""}`}
                  onClick={() => !bloqueada && !resultado && jugarCarta(carta)}
                >
                  <div className="carta-emoji-grande">{carta.emoji}</div>
                  <div className="carta-nombre-juego">{carta.nombre}</div>
                  <div className="carta-desc-juego">{carta.descripcion}</div>
                  {bloqueada && <div className="enfriamiento">❄️ {enf} ronda{enf > 1 ? "s" : ""}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pantalla === "juego" && esperandoComodin && comodin && !eligiendoDescongelar && (
        <div className="comodin">
          <h2 className="titulo-medieval">🃏 Pregunta Comodín</h2>
          <p className="comodin-instruccion">¡Responde bien para elegir qué guerrero descongelar! ⏱️ {tiempoComodin}s</p>
          <p className="comodin-pregunta">{comodin.pregunta}</p>
          <div className="comodin-opciones">
            {comodin.opciones.map((op, i) => (
              <button
                key={i}
                className={`btn-opcion ${comodin.respondido ? (i === comodin.correcta ? "correcta" : i === comodin.opcionElegida ? "incorrecta" : "") : ""}`}
                onClick={() => !comodin.respondido && responderComodin(i)}
              >
                {op}
              </button>
            ))}
          </div>
          {comodin.respondido && (
            <p className="comodin-resultado">{comodin.correcto ? "✅ ¡Correcto! Elige qué guerrero descongelar." : "❌ Incorrecto. El enfriamiento continúa."}</p>
          )}
        </div>
      )}

      {pantalla === "juego" && eligiendoDescongelar && (
        <div className="comodin">
          <h2 className="titulo-medieval">¿A quién descongelar?</h2>
          <p className="comodin-instruccion">Elige el guerrero que quieres liberar del enfriamiento.</p>
          <div className="cartas-descongelar">
            {cartasJugador.map(carta => (
              <div
                key={carta.id}
                className={`carta-juego ${!enfriamientoJugador[carta.id] ? "no-congelada" : ""}`}
                onClick={() => descongelarGuerrero(carta.id)}
              >
                <div className="carta-emoji-grande">{carta.emoji}</div>
                <div className="carta-nombre-juego">{carta.nombre}</div>
                <div className="carta-desc-juego">
                  {enfriamientoJugador[carta.id] > 0 ? "❄️ Congelado" : "✅ Disponible"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pantalla === "victoria" && (
        <div className="pantalla-final victoria">
          <h1 className="titulo-medieval">🏆 ¡Victoria!</h1>
          <p>¡Los Mexicas resistieron la conquista! Tenochtitlan permanece en pie.</p>
          <button onClick={() => setPantalla("menu")}>Volver al menú</button>
        </div>
      )}

      {pantalla === "derrota" && (
        <div className="pantalla-final derrota">
          <h1 className="titulo-medieval">💀 Derrota</h1>
          <p>Tenochtitlan ha caído ante los conquistadores españoles.</p>
          <button onClick={() => setPantalla("menu")}>Intentar de nuevo</button>
        </div>
      )}

    </div>
  );
}