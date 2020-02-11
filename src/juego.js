import { TurnOrder } from 'boardgame.io/core';
import Enemigos from './statsEnemigos';
import MazosEnemigos from './mazosEnemigos';
import { PluginPlayer } from 'boardgame.io/plugins';

const MazoHeroeBasico = [
    1,
    2, 2,
    3, 3, 3, 3, 3,
    4, 4, 4, 4,
    5, 5,
    6,
];

const enemigo = (ctx, clase, subclase = -1) => {
    if (subclase === -1) {
        subclase = ctx.random.Die(clase.mazos.length) - 1;
    }
    const mazo = clase.mazos[subclase];

    const nombre = Object.keys(Enemigos).find(busca => Enemigos[busca] === clase)
        + " " + Object.keys(MazosEnemigos).find(busca => MazosEnemigos[busca] === mazo);

    return {
        nombre: nombre,

        danoRecibido: 0,
        cartaPorJugarVisible: false,
        mazoPorJugar: ctx.random.Shuffle(mazo),
        cartaPorJugar: null,
        mazoJugado: [],

        clase: clase,
    }
}

const robarCartasInicial = (G, ctx, jug) => {
    const cantCartas = Math.max(0, Math.min(G.players[jug].vida - G.players[jug].dano, G.players[jug].mazo.length));
    robarXCartas(G, ctx, cantCartas, jug);
    ctx.events.endPhase();
}
const robarCarta = (G, ctx, jug) => {
    if (G.players[jug].accionesTomadas.includes("robarCarta")) return;
    if (G.players[jug].mazo.length === 0) return;

    robarXCartas(G, ctx, 1, jug);

    G.players[jug].accionesTomadas.push("robarCarta");
    ctx.events.endPhase();
}
const esquivar = (G, ctx, carta, jug) => {
    if (G.players[jug].accionesTomadas.includes("esquivar")) return;
    if (!G.players[jug].mano.includes(carta)) return;

    G.players[jug].mano = G.players[jug].mano.filter(e => e !== carta);
    G.players[jug].esquivar.push(carta);

    G.players[jug].accionesTomadas.push("esquivar");
    ctx.events.endPhase();
}
const atacar = (G, ctx, cartas, objetivo, jug) => {
    if (G.players[jug].accionesTomadas.includes("atacar")) return;
    if (cartas.length < 2) return;
    if (!cartas.every(e => G.players[jug].mano.includes(e))) return;

    G.players[jug].mano = G.players[jug].mano.filter(e => !cartas.includes(e));
    G.players[jug].atacar = cartas.concat(G.players[jug].atacar);
    if (G.enemigos[objetivo]) G.players[jug].objetivo = objetivo;

    G.players[jug].accionesTomadas.push("atacar");
    ctx.events.endPhase();
}
const buscarReparo = (G, ctx, jug) => {
    if (G.players[jug].accionesTomadas.includes("buscarReparo")) return;
    if (G.players[jug].peligro.length === 0) return;

    G.players[jug].mazo = ctx.random.Shuffle(G.players[jug].mazo.concat(G.players[jug].peligro));
    G.players[jug].peligro = [];

    G.players[jug].accionesTomadas.push("buscarReparo");
    ctx.events.endPhase();
}
const descansar = (G, ctx, jug) => {
    if (G.players[jug].accionesTomadas.includes("descansar")) return;
    if (G.players[jug].golpes.length === 0) return;

    G.players[jug].mazo = ctx.random.Shuffle(G.players[jug].mazo.concat(G.players[jug].golpes));
    G.players[jug].golpes = [];

    G.players[jug].accionesTomadas.push("descansar");
    ctx.events.endPhase();
}
const enemigosPreparan = (G, ctx) => {
    for (let i = 0; i < G.enemigos.length; i++) {
        if (G.enemigos[i].danoRecibido >= G.enemigos[i].clase.hpBase) continue;
        G.enemigos[i].cartaPorJugarVisible = false;
        if (G.enemigos[i].mazoPorJugar.length === 0) {
            G.enemigos[i].mazoPorJugar = ctx.random.Shuffle(G.enemigos[i].mazoJugado);
            G.enemigos[i].mazoJugado = [];
        }
        if (G.enemigos[i].cartaPorJugar != null) G.enemigos[i].mazoJugado.push(G.enemigos[i].cartaPorJugar);
        G.enemigos[i].cartaPorJugar = G.enemigos[i].mazoPorJugar.shift();
    }
}
const enemigoAtaca = (G, ctx) => {
    for (let i = 0; i < G.enemigos.length; i++) {
        G.enemigos[i].cartaPorJugarVisible = true;
    }
}
const enemigoReset = (G, ctx) => {
    for (let i = 0; i < G.enemigos.length; i++) {
        G.enemigos[i].cartaPorJugarVisible = false;
        if (G.enemigos[i].cartaPorJugar != null) {
            G.enemigos[i].mazoJugado.push(G.enemigos[i].cartaPorJugar);
            G.enemigos[i].cartaPorJugar = null;
        }
    }
}
const moverCartas = (G, ctx) => {
    Object.keys(G.players).forEach((jug) => {
        G.players[jug].accionesTomadas = [];
        G.players[jug].peligro = G.players[jug].esquivar.concat(G.players[jug].peligro);
        G.players[jug].golpes = G.players[jug].atacar.concat(G.players[jug].golpes);
        G.players[jug].esquivar = [];
        G.players[jug].atacar = [];
    });
    enemigoReset(G, ctx);
}
const resolverAcciones = (G, ctx) => {
    Object.keys(G.players).forEach((jug) => {
        const esquiva = G.players[jug].esquivar.length === 0 ? -99 : G.players[jug].dataCartas[G.players[jug].esquivar[0]];
        let ataqueEnemigo = 0;
        G.enemigos.forEach(e => {
            if (e.danoRecibido < e.clase.hpBase && e.cartaPorJugar) ataqueEnemigo += e.cartaPorJugar[0];
        });
        const peligro = (G.players[jug].dataCartas[G.players[jug].peligro[0]] || 0) + ataqueEnemigo;
        console.log(`esquiva ${esquiva} >= peligro ${peligro}`);
        if (peligro > esquiva) {
            G.players[jug].dano++;
        }

        if (G.players[jug].atacar.length > 0) {
            G.players[jug].atacar = ctx.random.Shuffle(G.players[jug].atacar);
            const objetivo = G.players[jug].objetivo;
            const defensaObjetivo = G.enemigos[objetivo].clase.defensaBase + G.enemigos[objetivo].cartaPorJugar[1];
            const valorAtaque = G.players[jug].dataCartas[G.players[jug].atacar[0]];
            console.log(`ataque ${valorAtaque} >= def ${defensaObjetivo}`);
            if (valorAtaque >= defensaObjetivo) {
                G.enemigos[objetivo].danoRecibido += (G.players[jug].atacar.length - 1);
            }
        }
    });
}

const robarXCartas = (G, ctx, cantCartas, jug) => {
    for (let i = 0; i < cantCartas; i++) {
        if (G.players[jug].mazo.length > 0)
            G.players[jug].mano.unshift(G.players[jug].mazo.pop());
    }
}
const genPlayers = (ctx) => {
    let players = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
        players[i + ''] = {
            id: i + '',
            vida: 3,
            dano: 0,
            dataCartas: MazoHeroeBasico,
            mazo: ctx.random.Shuffle((new Array(MazoHeroeBasico.length)).fill(1).map((el, index) => index)),
            objetivo: 0,
            mano: [],
            esquivar: [],
            atacar: [],
            peligro: [],
            golpes: [],
            accionesTomadas: [],
        };
    }
    return players;
}

//Juego
export default {
    name: 'vigilantes-de-belona',

    moves: {},

    setup: (ctx, setupData) => ({
        enemigos: [Enemigos.Goblin, Enemigos.Goblin, Enemigos.Orco].map(enemigoStats => enemigo(ctx, enemigoStats)),
        players: genPlayers(ctx),
        primerRonda: true,
    }),


    // playerSetup: (playerID) => {
    //     const a = {
    //         nombre: playerID,
    //         vida: 3,
    //         mazo: MazoHeroeBasico.slice(),
    //         mano: [],
    //         esquivar: [],
    //         atacar: [],
    //         peligro: [],
    //         golpe: [],
    //         accionesTomadas: [],
    //     };
    //     console.log(a); return a;},
    // plugins: [PluginPlayer],

    turn: { order: TurnOrder.RESET },

    phases: {
        robar: {
            onBegin: (G, ctx) => {
                if (G.primerRonda) {
                    Object.keys(G.players).forEach((elem) => robarXCartas(G, ctx, 3, elem));
                    G.primerRonda = false;
                }
            },
            moves: { robarCartasInicial },
            next: 'primerAccion',
            start: true,
        },
        enemigoPrepara: {
            onBegin: (G, ctx) => {
                enemigosPreparan(G, ctx);
                // ctx.events.endPhase();
            },
            // endIf:(G,ctx)=>true,
            moves: {},
            // next: 'primerAccion',
            next: 'primerAccion',
            // start: true,
        },
        primerAccion: {
            onBegin: (G, ctx) => {
                enemigoReset(G, ctx);
                enemigosPreparan(G, ctx);
            },
            moves: { esquivar, atacar, buscarReparo, descansar, robarCarta },
            next: 'segundaAccion'
        },
        ataqueEnemigo: {
            onBegin: (G, ctx) => {
                enemigoAtaca(G, ctx);
                ctx.events.endPhase();
            },
            moves: {},
            // next: 'segundaAccion',
            next: 'enemigoPrepara',
        },
        segundaAccion: {
            onBegin: (G, ctx) => {
                enemigoAtaca(G, ctx);
            },
            moves: { esquivar, atacar, buscarReparo, descansar, robarCarta },
            next: 'sumario',
        },
        sumario: {
            onBegin: (G, ctx) => {
                resolverAcciones(G, ctx);
            },
            moves: {},
            next: 'robar',
            onEnd: (G, ctx) => {
                moverCartas(G, ctx);
            },
        }
    }

};