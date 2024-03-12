import * as three from 'three/src/Three.js'
import * as raycastHelper from '@/objects/raycastHelper.js'
import {GLTFLoader} from "three/addons";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as mixerHelper from "@/objects/mixerHelper.js"
import * as global from '@/objects/global.js'

const gltfLoader = new GLTFLoader();
const fontLoader = new FontLoader()
const textureLoader = new three.TextureLoader()
textureLoader.setPath(global.basePath)
gltfLoader.setPath(global.basePath)
fontLoader.setPath(global.basePath)

/**
 * @type three.BufferGeometry
 */
let blockGeometry = undefined
let numberFont = undefined

const flagTexture = textureLoader.load("/assets/flag.png")
const flagMaterial = new three.MeshLambertMaterial({map: flagTexture, transparent: true})
const mouseHoverKeyFrame = new three.KeyframeTrack(".position", [0, 0.25], [0,0,0,0,-0.2,0])
const mineCountMaterials = (()=> {
    let ans = [];
    let colors = [0x0000ff, 0x007b00, 0xff0000, 0x00007b, 0x7b0000, 0x007b7b, 0x000000, 0x808080]
    for(let color of colors){
        ans.push(new three.MeshLambertMaterial({color: color}))
    }

    return ans
})()
const mouseHoverClip = new three.AnimationClip( 'Action', 0.25, [ mouseHoverKeyFrame ] );
// 退场动画的kf
const disappearKeyFrame = new three.KeyframeTrack(".position", [0, 0.25], [0,0,0,0,-1.1,0])
disappearKeyFrame.setInterpolation(three.InterpolateSmooth)
const disappearClip = new three.AnimationClip( 'Action', 0.25, [ disappearKeyFrame ] );

const flagGeometry = (()=>{
    const flagVertices = new Float32Array([
        0,0,0,
        0,0,1,
        1,0,1,
        1,0,0
    ])

    const flagIndices = new Uint8Array([
        1,2,3,1,3,0
    ])

    let surfaceUVs = new Float32Array([
        0,1,
        0,0,
        1,0,
        1,1,
    ])

    let surfaceGeometry = new three.BufferGeometry();
    surfaceGeometry.setAttribute("position", new three.BufferAttribute(flagVertices, 3))
    surfaceGeometry.setAttribute("uv", new three.BufferAttribute(surfaceUVs, 2))
    surfaceGeometry.index = new three.BufferAttribute(flagIndices, 1)
    surfaceGeometry.computeVertexNormals();

    return surfaceGeometry
})()


const tntMaterials = (() => {
    let topImg = textureLoader.load("/assets/tnt_top.png")
    let bottomImg = textureLoader.load("/assets/tnt_bottom.png")
    let sideImg = textureLoader.load("/assets/tnt_side.png")
    topImg.magFilter = three.NearestFilter;
    bottomImg.magFilter = three.NearestFilter;
    sideImg.magFilter = three.NearestFilter;

    return [
        new three.MeshLambertMaterial({ map: sideImg }), //right side
        new three.MeshLambertMaterial({ map: sideImg}), //left side
        new three.MeshLambertMaterial({ map: topImg}), //top side
        new three.MeshLambertMaterial({ map: bottomImg}), //bottom side
        new three.MeshLambertMaterial({ map: sideImg}), //front side
        new three.MeshLambertMaterial({ map: sideImg}), //back side
    ];

})()

const loadBlock = () =>{
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            // resource URL
            '/assets/block.glb',
            // called when the resource is loaded
            function ( gltf ) {

                // scene.add( gltf.scene );

                for(let child of gltf.scene.children){
                    console.log(child, gltf.type)
                    if(child.type === "Mesh"){
                        child.geometry.scale(0.5, 0.5, 0.5)
                        blockGeometry = child.geometry
                        resolve()
                    }
                }

            },
            // called while loading is progressing
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                reject( error );

            }
        );
    })
}

const loadFont = () => {
    return new Promise((resolve, reject) => {
        fontLoader.load("/assets/helvetiker_regular.typeface.json", (font)=>{
            numberFont = font;
            resolve()
        })
    })
}

export async function loadBlockAssets(){
    await loadBlock()
    await loadFont()
}

export class MineBlock extends raycastHelper.RaycastableObject{
    constructor(x, y, openFunction, flagFunction) {
        super();
        this.mineCount = 0

        // 外面的group包含碰撞箱、底面显示的东西等，与里面的box。里面的box包含可移动的部分
        this.group = new three.Group()
        this.groupInner = new three.Group()
        this.group.add(this.groupInner)

        this.hitBoxMesh = new three.Mesh(new three.BoxGeometry())
        this.hitBoxMesh.position.set(0,0.5,0)
        this.hitBoxMesh.visible = false
        this.group.add(this.hitBoxMesh)

        this.blockMesh = new three.Mesh(
            blockGeometry.clone(),
             new three.MeshStandardMaterial({
                color: 0x475cd1,
                metalness: 0,
                roughness: 0,
            })
        )
        this.groupInner.add(this.blockMesh)
        this.blockMesh.position.set(0,0.5,0)
        this.blockMesh.material.shiness = 1000
        this.blockMesh.castShadow = true
        // this.blockMesh.material = new three.MeshStandardMaterial({
        //     color: 0x66ccff,
        //     metalness: 0,
        //     roughness: 0,
        // })

        this.flag = new three.Mesh(flagGeometry, flagMaterial)
        this.groupInner.add(this.flag)
        this.flag.position.set(-0.5,1.01,-0.5)
        this.flag.visible = false

        this.mineCountMesh = undefined






        // 动画部分
        this.mixer = new three.AnimationMixer(this.groupInner)
        /**
         * @type {three.AnimationAction}
         */
        this.hoverAction = this.mixer.clipAction(mouseHoverClip)
        this.hoverAction.setLoop(three.LoopOnce)
        this.hoverAction.clampWhenFinished = true
        mixerHelper.registerAnimationMixer(this.mixer)

        this.mixer2 = new three.AnimationMixer(this.groupInner)
        /**
         * @type {three.AnimationAction}
         */
        this.disappearAction = this.mixer2.clipAction(disappearClip)
        this.disappearAction.setLoop(three.LoopOnce)
        this.disappearAction.clampWhenFinished = true
        mixerHelper.registerAnimationMixer(this.mixer2)

        this.mixer2.addEventListener('finished', ()=>{
            this.groupInner.visible = false
        })



        raycastHelper.registerRaycastObj(this.hitBoxMesh, this)

        // 处理逻辑部分
        this.isOpen = false
        this.flagged = false
        this.openFunction = openFunction
        this.flagFunction = flagFunction
        this.x = x;
        this.y = y;


    }

    setMineCount(newCount) {
        this.mineCount = newCount
        if(this.mineCount > 0){
            let mineCountShape = numberFont.generateShapes( this.mineCount + '', 0.5 );
            let mineCountGeometry = new three.ShapeGeometry( mineCountShape );
            mineCountGeometry.computeBoundingBox();
            this.mineCountMesh = new three.Mesh(mineCountGeometry, mineCountMaterials[this.mineCount - 1])
            this.mineCountMesh.position.set(-0.25,0.01,0.25)
            this.mineCountMesh.rotateX(-Math.PI/2)
            this.mineCountMesh.visible = false
            this.group.add(this.mineCountMesh)

        }else if(this.mineCount === -1){
            this.mineCountMesh = new three.Mesh(new three.BoxGeometry(0.5, 0.5, 0.5), tntMaterials)
            this.mineCountMesh.position.set(0,0.5,0)
            this.group.add(this.mineCountMesh)
            this.mineCountMesh.visible = false
        }else{
            this.mineCountMesh = null
        }
    }



    getGroup(){
        return this.group;
    }

    onHoverIn() {
        if(!this.isOpen){
            this.hoverAction.timeScale = 1
            this.hoverAction.reset()
            this.hoverAction.play()

        }

    }

    onHoverOut() {
        if(!this.isOpen){
            this.hoverAction.timeScale = -1;
            this.hoverAction.paused = false
        }

    }

    onLeftClick() {
        // console.log("LeftClick!")
        if(this.flagged){
            return
        }
        this.openFunction && this.openFunction(this.x, this.y)

    }

    open() {
        this.isOpen = true
        this.hoverAction.enabled = false;
        this.disappearAction.play()
        if(this.mineCount !== 0){
            this.mineCountMesh.visible = true
        }
        raycastHelper.unregisterRaycastObj(this.hitBoxMesh)
    }

    onRightClick() {
        // 切换旗帜状态
        // console.log("RightClick!")
        if(!this.isOpen){
            this.flagged = !this.flagged;
            this.flagFunction(this.x, this.y, this.flagged)
            this.flag.visible = this.flagged;
        }
    }

    getOutlineMesh(){
        return this.blockMesh
    }

}