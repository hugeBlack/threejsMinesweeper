<script setup>
import * as three from 'three/src/Three.js'
import {onMounted, ref} from "vue";
import {generateChessBoard} from "@/objects/chessboard.js"
import * as raycastHelper from "@/objects/raycastHelper.js"
import * as mixerHelper from "@/objects/mixerHelper.js"
import * as mineBlock from "@/objects/mineBlock.js"
import * as core from '@/objects/minesweepCore.js'

import {FPSController} from "@/objects/control.js";

import * as global from '@/objects/global.js'

import {EffectComposer, FXAAShader, OutlinePass, OutputPass, RenderPass, ShaderPass} from "three/addons";

const statusStr = ref("进行中...")
const gameStatus = ref(1)
const mineCount = ref(10)

const canvas = ref()

const scene = new three.Scene()
const camera = new three.PerspectiveCamera(45, 1024/768)

const loader = new three.CubeTextureLoader()
loader.setPath(global.basePath + '/assets/Bridge2/')
const textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
scene.background = textureCube


const light = new three.AmbientLight(0x7c7c7c, 3);
const light2 = new three.DirectionalLight(0xffffff, 3)
light2.castShadow = true
light2.position.set(15,5,15)
const lightHelper = new three.PointLightHelper(light2, 1, 0xffffff)

scene.add(lightHelper)
scene.add(light2)
scene.add(light)


const axis = new three.AxesHelper(5)
scene.add(axis)


// const grid = new three.GridHelper(10,10)
// scene.add(grid)

const renderer = new three.WebGLRenderer({  alpha: true})
camera.position.set(5,5,15)

renderer.setPixelRatio(1024/768)
renderer.setSize(1024, 768)

renderer.setClearColor(0x999999)

renderer.domElement.addEventListener("click", ev => {
  controls.lock()
})

let composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const outlinePass = new OutlinePass( new three.Vector2(1024, 768), scene, camera );
outlinePass.edgeStrength = 3
outlinePass.edgeThickness = 1;
outlinePass.visibleEdgeColor.setHex(0xffffff);
outlinePass.hiddenEdgeColor.setHex(0xffffff);

composer.addPass( outlinePass );

const outputPass = new OutputPass();
composer.addPass( outputPass );

const effectFXAA = new ShaderPass( FXAAShader );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / 1024, 1 / 768 );
composer.addPass( effectFXAA );


// const controls = new OrbitControls( camera, renderer.domElement );
const controls = new FPSController(camera, renderer.domElement, 0.2)


onMounted(()=>{
  canvas.value.appendChild(renderer.domElement)
})

renderer.shadowMap.enabled = true

raycastHelper.init(new three.Raycaster() ,outlinePass, renderer.domElement)

const height = 9;
const width = 9;

let minefield = new core.MineField(new core.GameDifficulty(height, width, 10))
let init = false

/**
 *
 * @type {[mineBlock.MineBlock[]]}
 */
let mineObjField = new Array(height)

for(let j = 0; j < width; ++j){
    mineObjField[j] = new Array(width)
}

let canOperate = true;


const openFunction = (x, y) =>{
    if(minefield.statusCode !== 1 && minefield.statusCode !== 0){
        return
    }

    if(!init){
        minefield.deployMine(new core.Point(x, y))
        for(let i = 0; i < height; i++){
            for(let j = 0; j < width; j++){
                mineObjField[i][j].setMineCount(minefield.getBlock(new core.Point(j, i)).countNearby)
            }
        }
        minefield.print(true)
        init = true
    }
    let openQueue = minefield.openBlock(new core.Point(x, y))
    mineObjField[y][x].open()
    if(!openQueue)
        return
    canOperate = false

    for(let i =0; i < openQueue.length; ++i) {
        setTimeout((newI)=> {
            let p = openQueue[newI]
            mineObjField[p.y][p.x].open()
        }, i * 25, i)
    }

    setTimeout(()=>{
        canOperate = true
    }, 100 * openQueue.length + 50)

    if(minefield.statusCode === 3){
        statusStr.value = "你赢了!"
    }else if(minefield.statusCode === 2){
        statusStr.value = "你输了!"
    }
    gameStatus.value = minefield.statusCode
}

const flagFunction = (x, y, flagged) => {
    minefield.flagBlock(new core.Point(x, y), flagged)
    mineCount.value = minefield.getMineCountLeft()
}

// const GAME_STATUS_NOT_DEPLOYED = 0;
// const GAME_STATUS_PLAYING = 1;
// const GAME_STATUS_LOSE = 2;
// const GAME_STATUS_WIN = 3;


const board = generateChessBoard(9)
board.position.set(-1,0,-1)

board.castShadow = true
board.receiveShadow = true

scene.add(board)



mineBlock.loadBlockAssets().then(()=>{
    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            let block = new mineBlock.MineBlock(j, i, openFunction, flagFunction)
            mineObjField[i][j] = block;
            let group = block.getGroup()
            group.position.set(j,1.6,i)
            scene.add(group)
        }
    }

})





const pointer = new three.Vector2();


const animate = () => {
    requestAnimationFrame(animate)
    // cube.rotateX(0.01)
    controls.update();

    raycastHelper.setFromCamera(pointer, camera)
    raycastHelper.doRaycast()
    mixerHelper.updateAllMixers()
    composer.render();
    // renderer.render(scene, camera)
}
animate()



</script>

<template>
    <h2 :class="{gameStatusPlaying: gameStatus===1, gameStatusLose: gameStatus===2, gameStatusWin: gameStatus===3, title: true}">
        {{ statusStr }}
    </h2>
    <p>
        剩余雷数: {{mineCount}}
    </p>
    <div ref="canvas" class="canvas">
        <div class="aimer"></div>
    </div>
    <p>点击画面进入游戏，WASD 在水平面上移动，空格上升，LShift下降。左键打开格子，右键标记/取消标记。
        <a href="https://github.com/hugeBlack/threejsMinesweeper">Github</a>
    </p>

</template>

<style scoped>
.title{
    margin: 10px;
}

.aimer {
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: #fff;
    height: 4px;
    width: 4px;
    border-radius: 4px;
}

.gameStatusPlaying {
    color: #ccc;
}

.gameStatusLose {
    color: #f00;
    font-weight: bolder;
}

.gameStatusWin {
    color: #0f0;
    font-weight: bolder;
}

.canvas {
    position: relative;
}
</style>