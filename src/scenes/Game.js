import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.image("ball", "./public/assets/bola.png");
        this.load.image("paddle", "./public/assets/brick.png");
        this.load.image("blocks", "./public/assets/brick.png");
    }

    create() {
        console.log(this); // Verificar el contexto

        this.paddle = this.physics.add.image(400, 550, "paddle");
        this.paddle.setImmovable().setSize(700).setScale(0.2);

        // Inicializa la velocidad de la pelota
        this.initialBallVelocityX = -75;
        this.initialBallVelocityY = -300;

        // Crear un grupo de pelotas
        this.ballsGroup = this.physics.add.group();
        this.createBall(); // Crear la pelota inicial

        this.blocksGroup = this.physics.add.group(); // Inicializa el grupo de bloques

        const blockWidth = 100; // Ancho del bloque
        const blockHeight = 20; // Alto del bloque
        const rows = 3; // Cantidad de filas
        const cols = 5; // Cantidad de columnas
        const padding = 80; // Espaciado entre ladrillos

        const originalWidth = 670; // Ancho original del sprite
        const originalHeight = 370; // Alto original del sprite
        const scaleX = blockWidth / originalWidth; // Factor de escala para ancho
        const scaleY = blockHeight / originalHeight; // Factor de escala para alto

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const blockX = 160 + (col * (blockWidth + padding)); // Posición X del bloque
                const blockY = 50 + (row * (blockHeight + padding)); // Posición Y del bloque
                const block = this.blocksGroup.create(blockX, blockY, 'blocks').setImmovable();

                // Ajustar el tamaño de colisión
                block.setSize(600, 220);

                // Ajustar el tamaño visual del sprite
                block.setScale(scaleX, scaleY); // Aplicar escala
                block.setDisplaySize(blockWidth, blockHeight); // Asegurarse de que el tamaño del sprite se ajuste visualmente

                block.setData('hits', Math.floor(Math.random() * 3) + 1);
                block.setData('createsBall', true); // Marca como "creador de pelota"
            }
        }

        this.physics.add.collider(this.ballsGroup, this.blocksGroup, this.hitBlock, null, this);
        this.physics.add.collider(this.ballsGroup, this.paddle, this.hitPaddle, null, this);

        this.input.on('pointermove', (pointer) => {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 990);
        });

        this.input.on('pointerup', () => {
            if (this.ballsGroup.getChildren().length > 0 && this.ballsGroup.getChildren()[0].getData('onPaddle')) {
                this.ballsGroup.getChildren()[0].setVelocity(this.initialBallVelocityX, this.initialBallVelocityY);
                this.ballsGroup.getChildren()[0].setData('onPaddle', false);
            }
        });

        this.ballsGroup.getChildren()[0].setData('onPaddle', true);
    }

    createBall() {
        const ball = this.physics.add.sprite(400, 500, 'ball').setSize(900).setScale(0.04);
        ball.setCollideWorldBounds(true);
        ball.setBounce(1);
        ball.setData('onPaddle', true);
        this.ballsGroup.add(ball);
    }

    update() {
        this.ballsGroup.getChildren().forEach(ball => {
            if (ball.y > 600) { // Ajusta este valor según la altura del área de juego
                ball.destroy(); // Destruye la pelota al tocar el suelo
            }
        });

        if (this.ballsGroup.countActive(true) === 0) {
            // Aquí puedes agregar lógica para manejar el "Game Over"
            this.scene.start('GameOver'); // Cambia a la escena de Game Over
            return; // Detiene la ejecución del resto del método
        }

        // Reiniciar la escena si se eliminaron todos los bloques
        if (this.blocksGroup.countActive(true) === 0) {
            this.initialBallVelocityX *= 1.1; // Aumenta la velocidad en un 10%
            this.initialBallVelocityY *= 1.1; // Aumenta la velocidad en un 10%
            this.scene.restart(); // Reinicia la escena
        }
    }

    hitBlock(ball, block) {
        let hits = block.getData('hits');
        hits--;
        block.setData('hits', hits);

        // Cambia el tono del bloque cada vez que recibe un golpe
        let tint = 0xff0000; // Color de tinte inicial (rojo en este caso)
        let tintAmount = Math.floor((3 - hits) * (0x555555)); // Cada golpe oscurece el bloque más
        block.setTint(tint ^ tintAmount);

        // Crear una nueva pelota si el bloque es un creador de pelota
        if (hits <= 0 && block.getData('createsBall')) {
            this.createBall(); // Crear una nueva pelota
        }

        if (hits <= 0) {
            block.disableBody(true, true);
        }

        // Asegúrate de que la pelota rebote correctamente
        if (ball.body.velocity.y > 0) {
            ball.setVelocityY(-Math.abs(ball.body.velocity.y)); // Rebote hacia arriba
        } else {
            ball.setVelocityY(-Math.abs(ball.body.velocity.y)); // Mantén el rebote hacia arriba
        }

        // Asegúrate de que la pelota no se quede sin movimiento horizontal
        if (Math.abs(ball.body.velocity.x) < 50) {
            ball.setVelocityX(Phaser.Math.Between(50, 100) * Phaser.Math.RND.sign()); // Velocidad mínima al rebotar
        }
    }

    hitPaddle(ball, paddle) {
        let diff = 0;

        if (ball.x < paddle.x) {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff); // Ajusta la velocidad en X basado en la diferencia
        } else if (ball.x > paddle.x) {
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff); // Ajusta la velocidad en X basado en la diferencia
        } else {
            ball.setVelocityX(Phaser.Math.Between(2, 8)); // Un pequeño valor aleatorio si cae en el centro
        }

        // Asegúrate de que la pelota rebote adecuadamente hacia arriba
        ball.setVelocityY(-Math.abs(ball.body.velocity.y)); // Asegúrate de que la velocidad Y sea negativa (hacia arriba)
    }
}
