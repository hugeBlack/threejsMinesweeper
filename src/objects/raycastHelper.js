import * as three from 'three/src/Three.js'
import {OutlinePass} from "three/addons";
import * as global from '@/objects/global.js'

/**
 *
 * @type {Map<three.Mesh, RaycastableObject>}
 */
const raycastMap = new Map()

const allCanIntersectObject = []

/**
 *
 * @type {three.Mesh}
 */
let lastObject = null;

/**
 *
 * @type {three.Raycaster}
 */
let globalRaycaster = null;

/**
 * @type {OutlinePass}
 */
let globalOutlinePass = null;

/**
 *
 * @type {HTMLElement}
 */
let listenDom = null;


export class RaycastableObject{
    onLeftClick(){

    }

    onRightClick(){

    }

    onHoverIn(){

    }

    onHoverOut(){

    }

    /**
     * @return three.Mesh
     */
    getOutlineMesh(){

    }
}

/**
 *
 * @param mesh{three.Mesh}
 * @param raycastableObject{RaycastableObject}
 */
export function registerRaycastObj(mesh, raycastableObject){
    raycastMap.set(mesh, raycastableObject)
    if(allCanIntersectObject.indexOf(mesh) === -1){
        allCanIntersectObject.push(mesh)
    }
}

/**
 *
 * @param mesh{three.Mesh}
 */
export function unregisterRaycastObj(mesh){
    raycastMap.delete(mesh)
    let i = -1
    while((i = allCanIntersectObject.indexOf(mesh)) > -1){
        allCanIntersectObject.splice(i, 1)
    }
}


/**
 *
 * @param raycaster{three.Raycaster}
 * @param outlinePass{OutlinePass}
 * @param listenElement{HTMLElement}
 */
export function init(raycaster, outlinePass, listenElement){
    globalRaycaster = raycaster;
    globalOutlinePass = outlinePass
    listenDom = listenElement
    raycaster.far = 10

    listenElement.addEventListener("mousedown", (event)=>{
        if(!global.getCanUserClick())
            return

        let btnNum = event.button;
        if (btnNum===2){
            if(lastObject !== null){
                let obj = raycastMap.get(lastObject)
                if(obj && obj.onRightClick){
                    obj.onRightClick()
                }
            }
        }else if(btnNum===0){
            let obj = raycastMap.get(lastObject)
            if(obj && obj.onLeftClick){
                obj.onLeftClick()
            }
        }else{

        }

    })

    listenElement.addEventListener("contextmenu", ()=>{

    })
}

export function setFromCamera(pointer, camera){
    globalRaycaster.setFromCamera(pointer, camera)
}

const empty = []

export function doRaycast(){
    const intersects = globalRaycaster.intersectObjects( allCanIntersectObject );
    if (intersects.length > 0){

        let outlineMesh = raycastMap.get(intersects[0].object)?.getOutlineMesh()
        if(outlineMesh){
            globalOutlinePass.selectedObjects = [outlineMesh]
        }else{
            globalOutlinePass.selectedObjects = empty
        }

        if(lastObject !== intersects[0].object){
            raycastMap.get(lastObject)?.onHoverOut()
            raycastMap.get(intersects[0].object)?.onHoverIn()
            lastObject = intersects[0].object
        }

    } else {
        globalOutlinePass.selectedObjects = empty
        raycastMap.get(lastObject)?.onHoverOut()
        lastObject = null
    }

}

