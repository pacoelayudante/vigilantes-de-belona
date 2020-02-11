import './App.css';
import { Client } from 'boardgame.io/react';
import Juego from './juego';
import Tablero from './tablero';

const App = Client({ game: Juego, board: Tablero, numPlayers: 1, debug: false });

export default App;