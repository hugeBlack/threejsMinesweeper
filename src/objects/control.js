import * as three from 'three/src/Three.js'
import {PointerLockControls} from "three/addons";
import * as global from '@/objects/global.js'


export class FPSController {

    /**
     *
     * @param camera : three.Camera
     * @param domElement : HTMLElement
     * @param speed : number
     */
    constructor(camera, domElement, speed) {
        this.camera = camera;
        this.element = domElement;
        this.controls = new PointerLockControls( camera, domElement );
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveDown = false;
        this.moveUp = false;
        this.speed = speed


        this.controls.addEventListener( 'lock', ()=> {
            setTimeout((controls)=>{
                if(controls.isLocked)
                    global.setCanUserClick(true)
            }, 100, this.controls)
        } );

        this.controls.addEventListener( 'unlock', () => {
            global.setCanUserClick(false)
        } );

        const onKeyDown = ( event ) => {
            if(!this.controls.isLocked)
                return

            switch ( event.code ) {

                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;

                case 'Space':
                    event.preventDefault()
                    this.moveUp = true;
                    break;

                case 'ShiftLeft':
                    event.preventDefault()
                    this.moveDown = true;
                    break;

            }

        };

        const onKeyUp = ( event ) => {

            switch ( event.code ) {

                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;

                case 'Space':
                    this.moveUp = false;
                    break;

                case 'ShiftLeft':
                    this.moveDown = false;
                    break;
            }

        };

        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );


    }

    lock(){
        if(!this.controls.isLocked)
            this.controls.lock()
    }

    unlock() {
        if(this.controls.isLocked)
            this.controls.unlock()

    }

    /**
     * @return {three.Vector3}
     */
    getDelta(){
        let x = 0;
        let z = 0;
        let y = 0;
        if(this.moveForward)
            x += 1;
        if(this.moveBackward)
            x -= 1;
        if(this.moveRight)
            z += 1;
        if(this.moveLeft)
            z -= 1;
        if(this.moveUp)
            y += 1;
        if(this.moveDown)
            y -= 1;

        if(x === 0 && y === 0 && z === 0)
            return null



        let dir = new three.Vector3()

        this.controls.getDirection(dir)
        let yTmp = dir.y;
        dir.y = 0;


        let d = dir.clone().normalize().multiplyScalar(x * this.speed)
        /**
         * @type three.Vector3
         */
        let f = dir.clone().cross(new three.Vector3(0,1,0)).normalize().multiplyScalar(z * this.speed)
        let ans = new three.Vector3()

        ans.add(d)
        ans.add(f)

        ans.y = y * this.speed;
        return ans;
    }

    update(){
        /**
         * @type three.Vector3
         */
        let delta = this.getDelta()
        if(delta == null)
            return;

        let newPosition = this.camera.position.clone();
        newPosition.add(delta)

        this.camera.position.set(newPosition.x, newPosition.y, newPosition.z);

    }
}





