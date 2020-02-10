import React from 'react';
import './carta.css';

export default class Carta extends React.Component {
    render(){
        // const estilo = {
        //     backgroundImage:`url(${this.props.fondo})`,
        //     width:(this.props.width===undefined?'unset':this.props.width),
        //     height:(this.props.height===undefined?'unset':this.props.height),
        // };

        return (
            <div className={`carta ${this.props.className || ' '}`}>
                <div className="carta-interna">
                    <div className="carta-cara carta-reverso"></div>
                    <div className="carta-cara">{this.props.children}</div>                
                </div>
            </div>
        );
    }
}