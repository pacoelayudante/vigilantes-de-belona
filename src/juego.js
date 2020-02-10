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

class Enemigo {
    nombre = "Sin Nombre";

    danoRecibido = 0;
    cartaPorJugarVisible = false;
    mazoPorJugar = [];
    cartaPorJugar = null;
    mazoJugado = [];

    constructor(ctx, clase, subclase = -1) {
        this.clase = clase;
        if (subclase === -1) {
            subclase = ctx.random.Die(this.clase.mazos.length) - 1;
        }
        let mazo = clase.mazos[subclase];
        this.mazoPorJugar = ctx.random.Shuffle(mazo);

        // this.danoRecibido = ctx.random.Die(3)-1;

        this.nombre = Object.keys(Enemigos).find(busca => Enemigos[busca] === clase);
        this.nombre += " " + Object.keys(MazosEnemigos).find(busca => MazosEnemigos[busca] === mazo);
    }


}

const robarCartasInicial = (G, ctx, jug) => {
    const cantCartas = Math.min(G.players[jug].vida, G.players[jug].mazo.length);
    robarXCartas(G, ctx, cantCartas, jug);
    ctx.events.endPhase();
}
const robarCarta = (G, ctx, jug) => {
    if(G.players[jug].accionesTomadas.includes("robarCarta")) return;
    G.players[jug].accionesTomadas.push("robarCarta");
    robarXCartas(G,ctx,1,jug);
    ctx.events.endPhase();
}
const esquivar = (G, ctx, jug) => {
    if(G.players[jug].accionesTomadas.includes("esquivar")) return;
    G.players[jug].accionesTomadas.push("esquivar");

    ctx.events.endPhase();
}
const atacar = (G, ctx, jug) => {
    if(G.players[jug].accionesTomadas.includes("atacar")) return;
    G.players[jug].accionesTomadas.push("atacar");

    ctx.events.endPhase();
}
const buscarReparo = (G, ctx, jug) => {
    if(G.players[jug].accionesTomadas.includes("buscarReparo")) return;
    G.players[jug].accionesTomadas.push("buscarReparo");

    ctx.events.endPhase();
}
const descansar = (G, ctx, jug) => {
    if(G.players[jug].accionesTomadas.includes("descansar")) return;
    G.players[jug].accionesTomadas.push("descansar");
    ctx.events.endPhase();
}
const enemigosPreparan = (G, ctx) => {
    for (let i = 0; i < G.enemigos.length; i++) {
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
    Object.keys(G.players).forEach((jug)=>G.players[jug].accionesTomadas=[]);
    enemigoReset(G,ctx);
}

const robarXCartas = (G, ctx, cantCartas,jug) => {
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
            dataCartas: MazoHeroeBasico,
            mazo: ctx.random.Shuffle((new Array(MazoHeroeBasico.length)).fill(1).map((el, index) => index)),
            mano: [],
            esquivar: [],
            atacar: [],
            peligro: [],
            golpe: [],
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
        enemigos: [Enemigos.Goblin, Enemigos.Goblin, Enemigos.Orco].map(enemigoStats => new Enemigo(ctx, enemigoStats)),
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
                    Object.keys( G.players).forEach((elem) => robarXCartas(G, ctx,3, elem));
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
            next: 'robar',
            onEnd:(G,ctx)=>{
                moverCartas(G,ctx);
            },
        },
        moverCartas: {
            moves: { moverCartas },
            next: 'robar'
        }
    }
    
};