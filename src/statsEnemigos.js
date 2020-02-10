import MazosEnemigos from './mazosEnemigos';

export default {
    Orco:{ hpBase: 3, defensaBase: 5, estilo:"orco", mazos: [MazosEnemigos.Bruto, MazosEnemigos.Portero] },
    Goblin:{ hpBase: 2, defensaBase: 4, estilo:"goblin", mazos: [MazosEnemigos.Chicanero, MazosEnemigos.Lancero, MazosEnemigos.Escurridizo] },
};