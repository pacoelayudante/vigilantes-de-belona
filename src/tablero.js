import React from 'react';
import Carta from './carta';

class CartaEnemigo extends React.Component {
    render() {
        let contenido = (<div className="carta-enemigo"><div>¿?</div></div>);
        if (this.props.defensa || this.props.ataque || this.props.stats) {
            const ataque = this.props.ataque || (this.props.stats && this.props.stats[0]);
            const defensa = this.props.defensa || (this.props.stats && this.props.stats[1]);
            contenido = (
                <div className="carta-enemigo">
                    <div className="defensa">{defensa}</div>
                    <div className="ataque">{ataque}</div>
                </div>
            );
        }

        return (
            <Carta className={this.props.className || ' '}>
                {contenido}
            </Carta>
        );
    }
}

class Enemigo extends React.Component {
    render() {
        const vidas = new Array(this.props.enemigo.clase.hpBase).fill(0).map(
            (elem, index) => <div key={index} className={index < this.props.enemigo.danoRecibido ? "dano" : "sano"}></div>
        );
        const cartasPorJugar = this.props.enemigo.mazoPorJugar.map(
            (elem, index) => <CartaEnemigo key={index} className="por-jugar volteada" />
        );
        let cartaActual = [];
        let defensaActual = "?";
        if (this.props.enemigo.cartaPorJugar) {
            if (this.props.enemigo.cartaPorJugarVisible) {
                cartaActual = [(<CartaEnemigo key={cartasPorJugar.length} stats={this.props.enemigo.cartaPorJugar} className="carta-actual" />)];
                defensaActual = this.props.enemigo.clase.defensaBase + this.props.enemigo.cartaPorJugar[1];
            }
            else {
                cartaActual = [(<CartaEnemigo key={cartasPorJugar.length} className="carta-actual volteada" />)];
            }
        }
        const cartasJugadas = this.props.enemigo.mazoJugado.map(
            (elem, index) => <CartaEnemigo key={this.props.enemigo.mazoJugado.length - 1 + cartasPorJugar.length - index + cartaActual.length} stats={elem} className="ya-jugada" />
        );

        return (
            <div className={"enemigo " + this.props.enemigo.clase.estilo}>
                <div className="nombre">{this.props.enemigo.nombre}</div>
                <div className="defensa">
                    <div className="base">{this.props.enemigo.clase.defensaBase}</div>
                    <div className="actual">{defensaActual}</div>
                </div>
                <div className="mazo">{[...cartasJugadas, ...cartaActual, ...cartasPorJugar]}</div>
                <div className="hp">
                    {vidas}
                </div>
            </div>
        );
    }
}

class Enemigos extends React.Component {
    render() {
        const enemigos = this.props.enemigos.map((enem, index) => <Enemigo key={index} enemigo={enem} />)

        return (
            <div className="enemigos">
                {enemigos}
            </div>
        );
    }
}

class Accion extends React.Component {
    render() {
        if (this.props.accion) {
            return (<div><div onClick={() => this.props.accion(this.props.accion.name, this.props.jugador.id)} className={"boton accion " + (this.props.inactivo ? "inactivo" : "")}>{this.props.children}</div></div>);
        }
        else {
            return (<div><div className={"boton accion usado"}>{this.props.children}</div></div>);
        }
    }
}
class VidaJugador extends React.Component {
    render() {
        const vidas = new Array(this.props.jugador.vida + 1).fill(1).map((elem, index) =>
            <div key={index} className="vida sano"></div>
        );

        return (<div>
            <div onClick={() => this.props.robar3(this.props.jugador.id)} className={"boton " + (this.props.inactivo ? "inactivo" : "")}>+{this.props.jugador.vida} ROBAR</div>
            <div className="jugador-vidas">{vidas}</div>
        </div>);
    }
}
class Jugador extends React.Component {
    render() {
        const cantEnMano = this.props.jugador.mano.length;
        const cartas = this.props.jugador.dataCartas.map((elem, index) => {
            if (this.props.jugador.mazo.includes(index)) {
                return (<div key={index} className="jugador-carta en-mazo"><Carta className="volteada">¿?</Carta></div>);
            }
            else if (this.props.jugador.mano.includes(index)) {
                const pos = this.props.jugador.mano.indexOf(index);
                return (<div key={index} className="jugador-carta en-mano"
                    style={{ "--cant-cols": cantEnMano, "--col": pos }} ><Carta>{elem}</Carta></div>);
            }
            return (<div></div>);
        });

        const accionesBasicasInactivas = this.props.fase !== "primerAccion" && this.props.fase !== "segundaAccion";

        return (
            <div className="jugador">
                <div className="grilla-manual">
                    {cartas}
                </div>
                <div className="grilla">
                    <VidaJugador inactivo={this.props.fase !== "robar"} robar3={this.props.moves.robarCartasInicial} jugador={this.props.jugador} />
                    <Accion accion={this.props.jugador.accionesTomadas.includes("esquivar") ? null : this.props.moves.esquivar} inactivo={accionesBasicasInactivas} jugador={this.props.jugador}>Esquivar</Accion>
                    <Accion accion={this.props.jugador.accionesTomadas.includes("buscarReparo") ? null : this.props.moves.buscarReparo} inactivo={accionesBasicasInactivas} jugador={this.props.jugador}>Recuperar</Accion>
                    <Accion accion={this.props.jugador.accionesTomadas.includes("robarCarta") ? null : this.props.moves.robarCarta} inactivo={accionesBasicasInactivas} jugador={this.props.jugador}>Robar 1</Accion>
                    <Accion accion={this.props.jugador.accionesTomadas.includes("atacar") ? null : this.props.moves.atacar} inactivo={accionesBasicasInactivas} jugador={this.props.jugador}>Atacar</Accion>
                    <Accion accion={this.props.jugador.accionesTomadas.includes("descansar") ? null : this.props.moves.descansar} inactivo={accionesBasicasInactivas} jugador={this.props.jugador}>Descansar</Accion>
                </div>
            </div>
        );
    }
}

class Tablero extends React.Component {
    render() {
        return (
            <div>
                <Enemigos enemigos={this.props.G.enemigos} />
                <Jugador fase={this.props.ctx.phase} moves={this.props.moves} jugador={this.props.G.players[this.props.ctx.currentPlayer]} />
            </div>
        );
    }
}

export default Tablero;