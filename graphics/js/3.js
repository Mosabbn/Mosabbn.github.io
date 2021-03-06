
let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let root = null, box;

function createScene() {
    box = (5, 10 ,1);
    let starburstFnc = makeStarburstFnc(100, 1);
    root = createCube(starburstFnc, 400, box);
    scene.add(root);
}

function createCube(fnc, n, x, y, z, rad){
    let root = new THREE.Object3D();
    let coords = [-1.0, 1.0];
    for (let x = 0; x < 2; x++)
        for (let y = 0; y < 2; y++)
            for (let z = 0; z < 2; z++)
                root.vertices.push(new THREE.Vector3(coords[x], coords[y], coords[z]));
    let faces = [[0, 6, 4],  // back
                 [6, 0, 2],
                 [1, 7, 3],  // front
                 [7, 1, 5],
                 [5, 6, 7],  // right
                 [6, 5, 4],
                 [1, 2, 0],  // left
                 [2, 1, 3],
                 [2, 7, 6],  // top
                 [7, 2, 3],
                 [5, 0, 4],   // bottom
                 [0, 5, 1]
             ];
    for (let i = 0; i < 12; i++)
        geom.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]));
    for (let i = 0; i < 6; i++)
        for (let j = 0; j < 2; j++)
            root.faces[2*i+j].materialIndex = i;
    let mesh = new THREE.Mesh(root);
    for (let i = 0; i < n; i++) {
        let obj = fnc(i, n);
        let p = getRandomPointOnBox(-1 * 20/2 * Math.random());
        obj.position = (x.p, y.p);
        root.add(obj);
}
    return mesh, root;
}

function makeStarburstFnc(maxRays, maxRad) {
    function fnc() {
        return starburst(maxRays, maxRad);
    }
    return fnc;
}

function starburst(maxRays, maxRad) {
    let rad = 1;   
    let origin = new THREE.Vector3(0, 0, 0);
    let innerColor = getRandomColor(0.8, 0.1, 0.8);
    let black = new THREE.Color(0x000000);
    let geom = new THREE.BoxGeometry();
    let nbrRays = getRandomInt(-1, 1);
    for (let i = 0; i < nbrRays; i++) {
        let r = rad * getRandomFloat(0.1, maxRad);
        let dest = getRandomPointOnBox(r);
        geom.vertices.push(origin, dest);
        geom.colors.push(innerColor, black);
    }
    let args = {vertexColors: true, linewidth: 2};
    let mat = new THREE.LineBasicMaterial(args);
    return new THREE.Line(geom, mat, THREE.LineSegments);
}

let controls = new function() {
    this.nbrBursts = 400;
    this.burstRadius = 1.0;
    this.maxRays = 100;
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrBursts', 5, 2000).step(5).name('Nbr of bursts');
    gui.add(controls, 'burstRadius', 0.1, 5.0).name('Burst radius');
    gui.add(controls, 'maxRays', 5, 200).name('Max nbr of rays');
    gui.add(controls, 'Go');
}

function update() {
    let nbrBursts = controls.nbrBursts;
    let burstRadius = controls.burstRadius;
    let maxRays = controls.maxRays;
    if (root)
        scene.remove(root);
    let starburstFnc = makeStarburstFnc(maxRays, burstRadius);
    root = createCube(starburstFnc, nbrBursts, box);
    scene.add(root);
}


function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

}


function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}



init();
createScene();
initGui();
addToDOM();
animate();