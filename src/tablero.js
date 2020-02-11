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
                    <div className={"boton " + this.props.classBoton} onClick={this.props.atacar}>(Atacar)</div>
                    {vidas}
                </div>
            </div>
        );
    }
}

class Enemigos extends React.Component {
    classBoton(index) {
        if (this.props.indexAtacado && this.props.indexAtacado !== -1) return (this.props.indexAtacado === index ? " usado" : " oculto");
        if (this.props.uiAtaque === null) return " oculto";
        if (this.props.uiAtaque.length < 2) return " inactivo";
        return "";
    }

    render() {
        const enemigos = this.props.enemigos.map((enem, index) => <Enemigo key={index} enemigo={enem}
            classBoton={this.classBoton(index)} atacar={() => this.props.atacar(index)} />)

        return (
            <div className="enemigos">
                {enemigos}
            </div>
        );
    }
}

class Accion extends React.Component {
    render() {
        if (this.props.usable) {
            return (<div><div onClick={this.props.accion} className={"boton " + (this.props.inactivo ? "inactivo" : "")}>{this.props.stringAccion}</div>
                {this.props.children}</div>);
        }
        else {
            return (<div><div className={"boton usado"}>{this.props.stringAccion}</div>
                {this.props.children}</div>);
        }
    }
}
class VidaJugador extends React.Component {
    render() {
        const vidas = new Array(this.props.jugador.vida + 1).fill(1).map((elem, index) =>
            <div key={index} className={"vida "+(index<this.props.jugador.dano?"dano":"sano")}></div>
        );

        return (<div>
            <div onClick={() => this.props.robar3(this.props.jugador.id)} className={"boton " + (this.props.inactivo ? "inactivo" : "")}>
                +{this.props.jugador.vida-this.props.jugador.dano} ROBAR</div>
            <div className="jugador-vidas">{vidas}</div>
        </div>);
    }
}

const accionEsquivar = "esquivar";
const accionAtacar = "atacar";

class Jugador extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cartasElegidas: [],
            maxCartasElegibles: 0,
            minCartasElegidas: 0,
            accion: "",
            ultimaFase: null,
        };
    }

    componentDidUpdate() {
        if (this.state.ultimaFase !== this.props.fase) {
            this.setState({ ultimaFase: this.props.fase, cartasElegidas: [], maxCartasElegibles: 0, accion: "" });
            this.props.cambiarMensaje(null);
            this.props.cambiarUIAtaque(null);
        }
    }

    iniciarEsquivar() {
        this.props.cambiarMensaje(
            <div>Elije una carta para asignar como valor de esquiva<br />
                Para esquivar con exito el valor de la esquiva tiene que ser
        igual o mayor que el valor del peligro mas el ataque de los enemigos</div>
        );
        this.setState({
            maxCartasElegibles: 1, minCartasElegidas: 1, accion: accionEsquivar,
            cartasElegidas: this.state.cartasElegidas.slice(0, 1)
        });
        this.props.cambiarUIAtaque(null);
    }
    iniciarAtaque() {
        this.props.cambiarMensaje(
            <div>Elije mas de una carta para preparar un ataque<br />
                El daño del ataque es la cantidad de cartas elegidas menos una<br />
                Una de esas cartas será elegida al azar para determinar si el ataque es exitoso<br />
                Para que un ataque sea exitoso debe igualar o superar la defensa actual del enemigo atacado</div>
        );
        this.setState({ maxCartasElegibles: -1, minCartasElegidas: 2, accion: accionAtacar });
        this.props.cambiarUIAtaque(this.state.cartasElegidas);
    }

    elegirCarta(indexCarta) {
        if (this.state.maxCartasElegibles !== 0) {
            let cartasElegidas = this.state.cartasElegidas.slice();
            if (cartasElegidas.includes(indexCarta)) {
                cartasElegidas.splice(cartasElegidas.findIndex((e) => e === indexCarta), 1);
            }
            else {
                if (this.state.maxCartasElegibles > 0 && this.state.maxCartasElegibles <= cartasElegidas.length) {
                    const cant = cartasElegidas.length - this.state.maxCartasElegibles + 1;
                    for (let i = 0; i < cant; i++)cartasElegidas.shift();
                }
                cartasElegidas.push(indexCarta);
            }
            this.setState({ cartasElegidas: cartasElegidas });
            if (this.state.accion === accionAtacar) {
                this.props.cambiarUIAtaque(cartasElegidas);
            }
        }
    }

    render() {
        const jugador = this.props.jugador;
        const cantEnMano = jugador.mano.length;
        const cartas = jugador.dataCartas.map((elem, index) => {
            if (jugador.mazo.includes(index)) {
                return (<div key={index} className="jugador-carta en-mazo"><Carta className="volteada">¿?</Carta></div>);
            }
            else if (this.props.jugador.esquivar.includes(index)) {
                return (<div key={index} className="jugador-carta en-esquiva"><Carta className="">{elem}</Carta></div>);
            }
            else if (this.props.jugador.atacar.includes(index)) {
                const ataqueActivo = this.props.fase === "sumario" && jugador.atacar[0] === index ? " sobreponer" : "";
                const volteada = this.props.fase === "sumario" ? "" : " volteada";
                return (<div key={index} className={"jugador-carta en-ataque" + ataqueActivo}><Carta className={volteada}>{elem}</Carta></div>);
            }
            else if (jugador.peligro.includes(index)) {
                const peligroActivo = jugador.peligro[0] === index ? " sobreponer" : "";
                return (<div key={index} className={"jugador-carta en-peligro" + peligroActivo}><Carta className="">{elem}</Carta></div>);
            }
            else if (jugador.golpes.includes(index)) {
                const golpeActivo = jugador.golpes[0] === index ? " sobreponer" : "";
                return (<div key={index} className={"jugador-carta en-golpes" + golpeActivo}><Carta className="">{elem}</Carta></div>);
            }
            else if (jugador.mano.includes(index)) {
                const pos = jugador.mano.indexOf(index);
                const elegida = this.state.cartasElegidas.includes(index) ? " elegida" : "";
                const elegible = this.state.maxCartasElegibles === 0 ? "" : " elegible";
                return (<div key={index} className={"jugador-carta en-mano" + elegida + elegible}
                    style={{ "--cant-cols": cantEnMano, "--col": pos }} onClick={() => this.elegirCarta(index)}><Carta>{elem}</Carta></div>);
            }
            return (<div key={index}></div>);
        });

        const esquivar = this.props.moves.esquivar;
        const atacar = this.props.moves.atacar;
        const peligroActual = jugador.dataCartas[jugador.peligro[0]] || '0';

        const accionesBasicasInactivas = this.props.fase !== "primerAccion" && this.props.fase !== "segundaAccion";

        const accionesTomadas = jugador.accionesTomadas;
        const esquivaOculto = this.state.accion === accionEsquivar ? "" : " oculto";
        const ataqueOculto = this.state.accion === accionAtacar ? "" : " oculto";
        const cartasElegidas = this.state.cartasElegidas.length >= this.state.minCartasElegidas ? "" : " inactivo";

        return (
            <div className="jugador">
                <div className="grilla-manual">
                    <div key={"esquiva-base"} className="jugador-carta en-esquiva"><Carta className="">-99</Carta></div>
                    <div key={"peligro-base"} className="jugador-carta en-peligro"><Carta className="">0</Carta></div>
                    {cartas}
                </div>
                <div className="grilla">
                    <VidaJugador inactivo={this.props.fase !== "robar"} robar3={this.props.moves.robarCartasInicial} jugador={this.props.jugador} />

                    <Accion usable={!accionesTomadas.includes(accionEsquivar)} accion={() => this.iniciarEsquivar()}
                        inactivo={accionesBasicasInactivas || jugador.mano.length === 0} jugador={this.props.jugador} stringAccion="Esquivar">
                        <div className={"boton " + esquivaOculto + cartasElegidas}
                            onClick={() => esquivar(this.state.cartasElegidas[0], jugador.id)}>(Jugar)</div>
                    </Accion>

                    <Accion usable={!accionesTomadas.includes("buscarReparo")} accion={() => this.props.moves.buscarReparo(jugador.id)}
                        inactivo={accionesBasicasInactivas || jugador.peligro.length === 0} jugador={this.props.jugador} stringAccion="Recuperar">
                        <div className="peligro">{"PELIGRO: " + peligroActual}</div>
                    </Accion>

                    <Accion usable={!accionesTomadas.includes("robarCarta")} accion={() => this.props.moves.robarCarta(jugador.id)}
                        inactivo={accionesBasicasInactivas || jugador.mazo.length === 0} jugador={jugador} stringAccion="Robar 1"></Accion>

                    <Accion usable={!accionesTomadas.includes(accionAtacar)} accion={() => this.iniciarAtaque()}
                        inactivo={accionesBasicasInactivas || jugador.mano.length === 0} jugador={jugador} stringAccion="Atacar">
                        {/* <div className={"boton " + ataqueOculto + cartasElegidas}
                            onClick={() => atacar(this.state.cartasElegidas, -1, jugador.id)}>(Jugar)</div> */}
                    </Accion>

                    <Accion usable={!accionesTomadas.includes("descansar")} accion={() => this.props.moves.descansar(jugador.id)}
                        inactivo={accionesBasicasInactivas || jugador.golpes.length === 0} jugador={jugador} stringAccion="Descansar"></Accion>

                </div>
            </div>
        );
    }
}

class Mensaje extends React.Component {
    render() {
        const classOculto = this.props.children ? "" : "oculto";
        return (
            <div className={"mensaje " + classOculto}>{this.props.children}</div>
        );
    }
}

class Tablero extends React.Component {
    constructor(props) {
        super(props);
        this.state = { mensaje: null, ataque: null };
    }

    cambiarMensaje(contMensaje) {
        this.setState({ mensaje: contMensaje });
    }
    cambiarAtaque(cartas) {
        this.setState({ ataque: cartas });
    }
    atacarEnemigo(enemigo) {
        this.props.moves.atacar(this.state.ataque, enemigo, this.props.ctx.currentPlayer);
    }

    render() {
        const jug = this.props.G.players[this.props.ctx.currentPlayer];
        const indexAtacado = (jug.atacar.length === 0 ? -1 : jug.objetivo);

        let sumario = null;
        if (this.props.ctx.phase === "sumario") {
            sumario = (<div className="boton " onClick={this.props.events.endPhase}>Aceptar</div>);
        }

        return (
            <div>
                <Enemigos enemigos={this.props.G.enemigos} atacar={(arg) => this.atacarEnemigo(arg)}
                    uiAtaque={this.state.ataque} atacado={indexAtacado} />
                <Mensaje>{sumario || this.state.mensaje}</Mensaje>
                <Jugador fase={this.props.ctx.phase} moves={this.props.moves}
                    jugador={this.props.G.players[this.props.ctx.currentPlayer]}
                    cambiarMensaje={(arg) => this.cambiarMensaje(arg)} cambiarUIAtaque={(arg) => this.cambiarAtaque(arg)} />
            </div>
        );
    }
}

export default Tablero;