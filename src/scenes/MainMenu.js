import { Scene } from 'phaser';
import { getPhrase } from '../services/translations';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.image(512, 384, 'background');
        this.add.image(512, 300, 'logo');

        // Obtener el texto traducido para 'Menu Principal'
        this.add.text(512, 460, getPhrase('Menu Principal'), {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
