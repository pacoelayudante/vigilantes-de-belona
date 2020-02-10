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

const robarCartasInicial = (G, ctx) => {
    
}
const esquivar = (G, ctx) => {

}
const atacar = (G, ctx) => {

}
const buscarReparo = (G, ctx) => {

}
const descansar = (G, ctx) => {

}
const robarCarta = (G, ctx) => {

}
const enemigosPreparan = (G, ctx) => {
    for (let i = 0; i < G.enemigos.length; i++) {
        G.enemigos[i].cartaPorJugarVisible = false;
        if (G.enemigos[i].mazoPorJugar.length === 0) {
            G.enemigos[i].mazoPorJugar = ctx.random.Shuffle(G.enemigos[i].mazoJugado);
            G.enemigos[i].mazoJugado = [];
        }
        if (G.enemigos[i].cartaPorJugar != null) G.enemigos[i].mazoJugado.push(G.enemigos[i].cartaPorJugar);
        G.enemigos[i].cartaPorJugar = G.enemigos[i].mazoPorJugar.shift(); console.log(G.enemigos[i].mazoPorJugar);
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

}

const genPlayers = (ctx) => {
    let players = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
        players[i + ''] = {
            vida: 3,
            dataCartas: MazoHeroeBasico,
            mazo: ctx.random.Shuffle( (new Array(MazoHeroeBasico.length)).map((el,index)=>index) ),
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

    turn: { moveLimit: 1, order: TurnOrder.RESET },
    // flow: {
    phases: {
        // iniciarCombate: {
        //     moves: { combatir:(G,ctx)=>ctx.events.endPhase() },
        //     next: 'robar',
        //     start: true,
        // },
        robar: {
            // onBegin:(G,ctx)=>{
            //     robarCartasInicial();
            //     ctx.events.endPhase();
            // },
            moves: { robarCartasInicial },
            next: 'enemigoPrepara',
            start: true,
        },
        enemigoPrepara: {
            onBegin: (G, ctx) => {
                enemigoReset(G, ctx);
                enemigosPreparan(G, ctx);
                ctx.events.endPhase();
            },
            moves: {},
            // next: 'primerAccion',
            next: 'ataqueEnemigo',
            // start: true,
        },
        primerAccion: {
            moves: { esquivar, atacar, buscarReparo, descansar, robarCarta },
            next: 'ataqueEnemigo'
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
            moves: { esquivar, atacar, buscarReparo, descansar, robarCarta },
            next: 'moverCartas'
        },
        moverCartas: {
            moves: { moverCartas },
            next: 'robar'
        }
    }
    // }
};