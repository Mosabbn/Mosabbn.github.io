
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function starburstsOnSphereA(nbrBursts, sphereRadius, maxRays, maxRad) {
    let root = new THREE.Object3D();
    for (let i = 0; i < nbrBursts; i++) {
        let mesh = starburstA(maxRays, maxRad);
        let p = getRandomPointOnSphere(sphereRadius);
        mesh.position.set(p.x, p.y, p.z);
        root.add(mesh);
    }
    return root;
}

function starburstShape(type, nbrBursts, height, radius, maxRays, maxRad) {
    let root = new THREE.Object3D();
    
    switch (type) {
    case 0:
    root = starburstsOnCube(nbrBursts, height, maxRays, maxRad);
    break;
    case 1:
    root = starburstsOnCone(nbrBursts, height, radius, maxRays, maxRad);
    break;
    default:
    alert("Type not supported!");
    }

    return root;
}

function starburstsOnCube(nbrBursts, len, maxRays, maxRad) {
    let root = new THREE.Object3D();

    for (var i = 0; i < nbrBursts; i++) {
    let mesh = starburstA(maxRays, maxRad);
    let p = getRandomPointOnCube(len);
    mesh.position.set(p.x, p.y, p.z);
    root.add(mesh);
    }
    
    return root;
}

function starburstsOnCone(nbrBursts, height, radius, maxRays, maxRad) {
    let root = new THREE.Object3D();

    for (var i = 0; i < nbrBursts; i++) {
    let mesh = starburstA(maxRays, maxRad);
    let p = getRandomPointOnCone(height, radius);

    mesh.position.set(p.x, p.y, p.z);
    root.add(mesh);
    }

    return root;
}

function getRandomPointOnCube(len) {
    //first, pick a random vertex of a unit 1 cube
    let xaxis = ((Math.round(Math.random()) == 0) ? -1 : 1);
    let yaxis = ((Math.round(Math.random()) == 0) ? -1 : 1);
    let zaxis = ((Math.round(Math.random()) == 0) ? -1 : 1);

    //now pick a point on a face that touches that vertex
    let x = xaxis * (len/2);
    let y = yaxis * (len/2);
    let z = zaxis * (len/2);

    //only move in 2 axis to remain on a face
    let rand = Math.floor(Math.random() * 3);

    switch (rand) {
    case 0:
    x *= Math.random();
    y *= Math.random();
    break;
    case 1:
    x *= Math.random();
    z *= Math.random();
    break;
    case 2:
    y *= Math.random();
    z *= Math.random();
    break;
    }

    return new THREE.Vector3(x, y, z);
}

function getRandomPointOnCone(height, radius) {
    //get randon angle
    let angle = 2 * Math.PI * Math.random();

    //get random segment of radius
    let radPiece = radius * Math.random();

    //find our points on the base
    let x = Math.sin(angle) * radPiece;
    let z = Math.cos(angle) * radPiece; //z because we coo like that

    //find the length of the triangle from the base to the surface
    let len = radius - radPiece;

    //find angle of right triangle
    let triAngle = Math.atan(radius/height);

    //find height of segment, will be point on the surface of the cone
    let y = len / Math.tan(triAngle);

    //flip a coin to decide to put this point on the base or surface
    y *= Math.round(Math.random());  

    return new THREE.Vector3(x, y, z);
}

function starburstA(maxRays, maxRad) {
    let rad = 1;   // had been rad = 10?????
    let origin = new THREE.Vector3(0, 0, 0);
    let innerColor = getRandomColor(0.8, 0.1, 0.8);
    let black = new THREE.Color(0x000000);
    let geom = new THREE.Geometry();
    let nbrRays = getRandomInt(1, maxRays);
    for (let i = 0; i < nbrRays; i++) {
        let r = rad * getRandomFloat(0.1, maxRad);
        let dest = getRandomPointOnSphere(r);
        geom.vertices.push(origin, dest);
        geom.colors.push(innerColor, black);
    }
    let args = {vertexColors: true, linewidth: 2};
    let mat = new THREE.LineBasicMaterial(args);
    return new THREE.Line(geom, mat, THREE.LineSegments);
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
    camera.position.set(0, 0, 60);
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
    //get our mesh here
    var axes = new THREE.AxesHelper(30);
    //scene.add(our mesh); //add your meshes to the scene here
    
    let type = 1; //cone, 0 = cube
    let nbrBursts = 150;
    let radius = 15;
    let height = 20;
    let maxRays = 100;
    let maxRad = 1;
    
    root = starburstShape(type, nbrBursts, height, radius, maxRays, maxRad);
    
    scene.add(root);
    scene.add(axes);
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
    addToDOM();
    render();
    animate();
}