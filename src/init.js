const config = {
    title: "",
    scale:{ /* Notar que es diferente a lo que vimos antes */
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        type: Phaser.AUTO,
        parent: "contenedor",
        width: 800,
        height: 600,
    },
    scene: {
        preload,
        create,
        update,
    },
    physics: {
        default:'arcade',
        arcade: {
            gravity:{y: 300},
            debug: false /* true para que se vean los cuadros de impacto, false sino */
        }
    },
    
}

var game = new Phaser.Game(config);

function preload (){
    this.load.setPath('./Assets')
    this.load.image(['Coin',
        'Esfera',
        'Fondo',
        'Plataforma',
        'game_over',
        'red'])
    this.load.spritesheet('Kaze', 'Kaze.png', {frameWidth: 32.5, frameHeight: 48})
    this.load.audio('juntarmoneda', 'coin_audio.mp3')
    
};
function create (){
    this.add.image(400,300, 'Fondo').setScale(1, 1.15)
    plataforma = this.physics.add.staticGroup()
    plataforma.create(400, 590, 'Plataforma').setScale(2.5, 1).refreshBody();
    plataforma.create(400, 0, 'Plataforma').setScale(2.1, 1).refreshBody();
    plataforma.create(700, 410, 'Plataforma').setScale(0.3, 1).refreshBody();
    plataforma.create(400, 300, 'Plataforma').setScale(0.2, 1).refreshBody();
    plataforma.create(800, 150, 'Plataforma');
    plataforma.create(-50, 300, 'Plataforma');
    plataforma.create(0, 450, 'Plataforma');
    plataforma.create(600, 550, 'Plataforma').setScale(0.5, 1).refreshBody();
    plataforma.create(200, 150, 'Plataforma').setScale(0.3, 0.3).refreshBody()
    plataforma.getChildren()[0].setOffset(0, 10) /* Baja el limite fisico de la plataforma */
    plataforma.getChildren()[2].setOffset(0, 10)
    plataforma.getChildren()[3].setOffset(0, 10)
    plataforma.getChildren()[4].setOffset(0, 10)
    plataforma.getChildren()[5].setOffset(0, 10)
    plataforma.getChildren()[6].setOffset(0, 10)
    plataforma.getChildren()[7].setOffset(0, 10)
    

    /* KAZE  */
    Kaze = this.physics.add.sprite(230, 100, 'Kaze')
    Kaze.setCollideWorldBounds(true)
    Kaze.setBounce(0.3)
    this.physics.add.collider(Kaze,plataforma)
    /* Movimientos de KAZE */
    this.anims.create({
        key: 'Izquierda',
        frames: this.anims.generateFrameNumbers('Kaze', {start:0, end:3}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'Derecha',
        frames: this.anims.generateFrameNumbers('Kaze', {start:5, end:8}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Quieto',
        frames: [ { key: 'Kaze', frame: 4 } ],
        frameRate: 20
    });
    /* Moviendo a KAZE */
    cursors = this.input.keyboard.createCursorKeys()

    /* Las gemas del infinito */
    coins = this.physics.add.group({
        key: 'Coin',
        repeat: 11,
        setXY: { x: 12, y: 50, stepX: 64 }
    });
 
    this.physics.add.collider(plataforma, coins);
    coins.children.iterate(function (child) {
        child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    this.physics.add.overlap(Kaze, coins, esconder, null, this)

    /* Puntaje */
    puntosTexto = this.add.text(300,560, 'Puntos: 0', {fontSize: '40px', fill: 'red'})

    /* Enemigos */
    enemigos = this.physics.add.group()

    /* Como perder */
    this.physics.add.collider(Kaze, enemigos, choque, null, this)

    /* El sonido */
    juntar = this.sound.add('juntarmoneda')

    /* Particulas */
    particulas = this.add.particles('red')
    
    var emitter = particulas.createEmitter({

        speed: 50,
        scale: {start:1, end:0},
        blendMode: 'ADD'
    })
    emitter.startFollow(Kaze).setScale(0.2) /* Para que siga a Kaze */
  
    

};
function update(time, delta){
    if (cursors.left.isDown)
    {
        Kaze.setVelocityX(-200);
        Kaze.anims.play('Izquierda', true);
    }
    else if (cursors.right.isDown)
    {
        Kaze.setVelocityX(200);
        Kaze.anims.play('Derecha', true);
    }
    else
    {
        Kaze.setVelocityX(0);
        Kaze.anims.play('Quieto');
    }

    if (cursors.up.isDown && Kaze.body.touching.down)
    {
        Kaze.setVelocityY(-310);
    }

    if (gameOver) {
        /* TEXTO DE GAME OVER */
        this.add.image(400,300, 'game_over')
        Kaze.setTint(0x000000)
        if (cursors.space.isDown) {
            gameOver = false
            puntos = 0
            Kaze.clearTint()
            this.registry.destroy()
            this.events.off();
            this.scene.restart() }
        }
}; 
function esconder (Kaze, Coin) {
    Coin.disableBody(true, true)
    puntos +=10
    puntosTexto.setText('Puntos: '+ puntos)
    juntar.play()

     if (coins.countActive(true) == 0) { 
         /* Respawn de monedas */
         coins.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
        })
        /* Spawn de enemigos */
        var x = (Kaze.x < 400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400)
        Esferas = enemigos.create(x,16, 'Esfera')
        Esferas.setBounce(1)
        Esferas.setCollideWorldBounds(true)
        Esferas.setVelocity(Phaser.Math.Between(-100, 100), 5)
        this.physics.add.collider(enemigos,plataforma) }
}
var puntos = 0
var puntosTexto

var gameOver = false
function choque (Kaze, Esferas) {
    this.physics.pause()
    Kaze.anims.play('Quieto')
    gameOver = true
}

 
