import * as three from 'three/src/Three.js'

const tileWidth = 1.0;
const borderWidth = 0.5;
// 陷入的深度
const depth = 0.5;
// 棋盘的总高度
const height = 2;

// 参数结束
const loader = new three.TextureLoader();
let innerHeight = height - depth;



const indices = new Uint8Array([
    // 外部下部2个：BCA，CDA
    1,2,0,
    2,3,0,

    // 侧面1 AEFB AEF，AFB
    0,4,5,
    0,5,1,

    // 侧面2 DEHA DHE，DEA
    3,7,4,
    3,4,0,

    // 侧面3 HDGC CGH CHD
    2,6,7,
    2,7,3,

    // 侧面4 BFGC BFG BGC
    1,5,6,
    1,6,2,

    // 上部QTEH EHT ETQ
    4,7,19,
    4,19,16,

    // 上部JTSK JTS JSK
    9,19,18,
    9,18,10,

    // 上部SGFR RSG RGF
    17,18,6,
    17,6,5,

    // 上部LRQI QIL QLR
    16,8,11,
    16,11,17,

    // 上部凹陷边缘 ONJK NJK NKO
    13,9,10,
    13,10,14,

    // 上部凹陷边缘 OKLP OKL OLP
    14,10,11,
    14,11,15,

    // 上部凹陷边缘 LPMI PLI PIM
    15,11,8,
    15,8,12,

    // 上部凹陷边缘 MIJN MIJ MJN
    12,8,9,
    12,9,13,




])

const generateChessBoard = (tileCount) => {
    let outerWidth = tileCount * tileWidth + 2 * borderWidth;
    let innerWidth = tileCount * tileWidth;

    let vertices = new Float32Array([
        // 外面下部
        0, 0, 0, // A0
        outerWidth, 0, 0, // B1
        outerWidth, 0, outerWidth, // C2
        0, 0, outerWidth, // D3

        // 外面上部
        0, height, 0, // E4
        outerWidth, height, 0, // F5
        outerWidth, height, outerWidth, // G6
        0, height, outerWidth, // H7

        // 内部上部
        borderWidth, height, borderWidth, // I8
        borderWidth, height, borderWidth + innerWidth, // J9
        innerWidth + borderWidth, height, innerWidth + borderWidth, // K10
        innerWidth + borderWidth, height, borderWidth, // L11

        // 内部下部
        borderWidth, innerHeight, borderWidth, // M12
        borderWidth, innerHeight, borderWidth + innerWidth, // N13
        innerWidth + borderWidth, innerHeight, innerWidth + borderWidth, // O14
        borderWidth + innerWidth, innerHeight, borderWidth, // P15

        // 上部4个辅助点
        borderWidth, height, 0, //  Q16
        borderWidth + innerWidth,height, 0, // R17
        borderWidth + innerWidth, height, outerWidth, //  S18
        borderWidth,height, outerWidth, // T19

    ])

    let boxGeometry = new three.BufferGeometry();
    boxGeometry.setAttribute("position", new three.BufferAttribute(vertices, 3))
    boxGeometry.index = new three.BufferAttribute(indices, 1)
    boxGeometry.computeVertexNormals();


    let boxMaterial = new three.MeshStandardMaterial({
        color: 0xbec5d3,
        metalness: 0.5,
        roughness: 0.5,
    })
    let boxMesh = new three.Mesh(boxGeometry, boxMaterial)


    let surfaceVertices = new Float32Array([
        // 内部下部
        borderWidth, innerHeight + 0.1, borderWidth, // M0
        borderWidth, innerHeight + 0.1, borderWidth + innerWidth, // N1
        innerWidth + borderWidth, innerHeight + 0.1, innerWidth + borderWidth, // O2
        borderWidth + innerWidth, innerHeight + 0.1, borderWidth, // P3
    ])

    let surfaceIndices = new Uint8Array([
        // 上部凹陷底部NMOP MNO MOP
        0,1,2,
        0,2,3
    ])

    let surfaceUVs = new Float32Array([
        0,0,
        0,1,
        1,1,
        1,0
    ])

    let surfaceGeometry = new three.BufferGeometry();
    surfaceGeometry.setAttribute("position", new three.BufferAttribute(surfaceVertices, 3))
    surfaceGeometry.setAttribute("uv", new three.BufferAttribute(surfaceUVs, 2))
    surfaceGeometry.index = new three.BufferAttribute(surfaceIndices, 1)
    surfaceGeometry.computeVertexNormals();

    let texture = loader.load("/assets/bottom.png")
    texture.wrapS = texture.wrapT = three.RepeatWrapping
    texture.repeat.x = texture.repeat.y = tileCount
    let material = new three.MeshPhongMaterial({ map: texture })

    // let s = new three.BoxGeometry(2, 2)
    // s.rotateX(-Math.PI / 2)
    let surfaceMesh = new three.Mesh(surfaceGeometry, material)



    let ans = new three.Group()
    boxMesh.castShadow = true
    boxMesh.receiveShadow = true
    surfaceMesh.receiveShadow = true



    ans.add(boxMesh)
    ans.add(surfaceMesh)
    return ans;
}

export {
    generateChessBoard
}