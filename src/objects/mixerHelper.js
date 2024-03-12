import * as three from 'three/src/Three.js'

const clock = new three.Clock()
/**
 *
 * @type {Set<three.AnimationMixer>}
 */
const animationMixers = new Set()


/**
 *
 * @param mixer{three.AnimationMixer}
 */
export function registerAnimationMixer(mixer){
    animationMixers.add(mixer)
}

export function unregisterAnimationMixer(mixer){
    animationMixers.delete(mixer)
}

export function updateAllMixers() {
    const delta = clock.getDelta();
    for(let mixer of animationMixers){
        mixer.update(delta)
    }
}