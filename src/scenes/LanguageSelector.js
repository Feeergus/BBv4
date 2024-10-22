import { Scene } from 'phaser';
import { getTranslations } from '../services/translations';

const ES_AR = 'es-AR';
const EN_US = 'en-US';

export class LanguageSelector extends Scene {
    #textSpanish;
    #textEnglish;
    #wasChangedLanguage = 'NOT_FETCHED';

    constructor() {
        super('LanguageSelector');
    }

    create() {
        this.add.image(512, 384, 'background');
        this.add.image(512, 300, 'logo');

        const width = this.scale.width;
        const height = this.scale.height;

        this.add.text(512, 460, 'Selector de idiomas', {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const buttonSpanish = this.add
            .rectangle(width * 0.1, height * 0.75, 150, 75, 0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.POINTER_UP, () => {
                this.obtenerTraducciones(ES_AR);
            });

        this.#textSpanish = this.add
            .text(buttonSpanish.x, buttonSpanish.y, 'Español', { color: '#000000' })
            .setOrigin(0.5);

        const buttonEnglish = this.add
            .rectangle(width * 0.5, height * 0.75, 150, 75, 0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.POINTER_UP, () => {
                this.obtenerTraducciones(EN_US);
            });

        this.#textEnglish = this.add
            .text(buttonEnglish.x, buttonEnglish.y, 'Inglés', { color: '#000000' })
            .setOrigin(0.5);
    }

    updateWasChangedLanguage = () => {
        this.#wasChangedLanguage = 'FETCHED';
        this.scene.start('MainMenu');
    };

    async obtenerTraducciones(language) {
        this.#wasChangedLanguage = 'FETCHING';

        // Desactivar botones mientras se esperan las traducciones
        this.children.getAll().forEach(child => child.disableInteractive());

        try {
            const success = await getTranslations(language, this.updateWasChangedLanguage.bind(this));

            if (success) {
                // Asegurarse de que las traducciones se aplican antes de cambiar la escena
                this.#wasChangedLanguage = 'FETCHED';
                console.log('Traducciones cargadas correctamente');
                this.scene.start('MainMenu');
            } else {
                console.error('Error al obtener las traducciones');
            }
        } catch (error) {
            console.error('Hubo un error al obtener las traducciones:', error);
        } finally {
            // Reactivar botones una vez que se reciban las traducciones o falle
            this.children.getAll().forEach(child => child.setInteractive());
        }
    }
}
