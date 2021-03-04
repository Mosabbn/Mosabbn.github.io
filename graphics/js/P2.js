
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var ring;
var trans = 20;
const shapes = ["all", "cube", "tetrahedron", "octahedron", "icosahedron", "dodecahedron"];
var selectedType = "all";
let rainbow = false;

function makeSolidsFnc() {
    var solids;

    switch (selectedType) {
    case "all":
    solids = [
            new THREE.TetrahedronGeometry(1),
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.OctahedronGeometry(1),
            new THREE.IcosahedronGeometry(1),
            new THREE.DodecahedronGeometry(1)
    ];
    break;
    case "cube":
    solids = [new THREE.BoxGeometry(1, 1, 1)];
    break;
    case "tetrahedron":
    solids = [new THREE.TetrahedronGeometry(1)];
    break;
    case "octahedron":
    solids = [new THREE.OctahedronGeometry(1)];
    break;
    case "icosahedron":
    solids = [new THREE.IcosahedronGeometry(1)];
    break;
    case "dodecahedron":
    solids = [new THREE.DodecahedronGeometry(1)];
    break;
    }

    const nbrSolids = solids.length;

    function f(i, n) {
        let geom = solids[i % nbrSolids];
        let color = (rainbow == true) ? new THREE.Color().setHSL(i/n, 1.0, 0.5) : new THREE.Color().setRGB(0.71, 0.71, 0.71);
        let args = {color: color, opacity: 0.8, transparent: true};
        let mat = new THREE.MeshLambertMaterial(args);
        return new THREE.Mesh(geom, mat);
    }
    
    return f;
}

let solidsFnc = makeSolidsFnc();

function createRing(fnc, n, t) {
    let root = new THREE.Object3D();
    let angleStep = 2 * Math.PI / n;
    for (let i = 0, a = 0; i < n; i++, a += angleStep) {
        let s = new THREE.Object3D();
        s.rotation.y = a;
        let m = fnc(i, n);
        m.position.x = t;
        s.add(m);
        root.add(s);
    }
    
    return root;
}

function updateSolids() {
    if (ring)
        scene.remove(ring);
    
    ring = createRing(solidsFnc, controls.nbrSolids, 10);
    updateOpacityScale();
    scene.add(ring);
}

function updateOpacityScale() {
    if (ring) {
        let scale = controls.scale;
        let opacity = controls.opacity; 
        for (let c of ring.children) {
            let mesh = c.children[0];
            mesh.material.opacity = opacity;
            mesh.scale.set(scale, scale, scale);
        }
    }
}

function updateType(type) {
    selectedType = type;

    solidsFnc = makeSolidsFnc();
    updateSolids();
}

function updateRainbow() {
    if (rainbow)
    rainbow = false;
    else
    rainbow = true;

    updateSolids();
}

var controls = new function() {
    this.nbrSolids = 12;
    this.opacity = 0.8;
    this.scale = 1.0;
    this.type = shapes[0];
    this.rainbow = rainbow;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrSolids', 2, 80).step(1).onChange(updateSolids);
    gui.add(controls, 'opacity', 0.0, 1.0).step(0.1).onChange(updateOpacityScale);
    gui.add(controls, 'scale', 0.2, 4).onChange(updateOpacityScale);
    gui.add(controls, 'type').options(shapes).onChange(updateType);
    gui.add(controls, 'rainbow').onChange(updateRainbow);
}

function init() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer(
    {
        antialias: true,
        preserveDrawingBuffer: true
    }
    );
    
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(60, canvasRatio, 1, 1000);
    camera.position.set(30, 30, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function createScene() {
    ring = createRing(solidsFnc, 12, 10);

    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 10, 10);

    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000);
    light2.position.set(10, -10, -10);

    var ambientLight = new THREE.AmbientLight(0x222222);
    
    //get our mesh here
    var axes = new THREE.AxesHelper(30);
    //scene.add(our mesh); //add your meshes to the scene here
    
    scene.add(axes);
    scene.add(ring);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
}

function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');

    if (canvas.length > 0) {
    container.removeChild(canvas[0]);
    }

    container.appendChild(renderer.domElement);
}

function main() {
    init();
    createScene();
    initGui();
    addToDOM();
    render();
    animate();
}