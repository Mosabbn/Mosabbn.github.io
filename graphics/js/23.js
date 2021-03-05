

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();


var helixObject = {color: "Green",type: "Tetrahedron", radius: 2, nbrSolids: 50, angle: Math.PI / 4, distance: 0.5
};

const gui = new dat.GUI({ autoPlace: true });
gui.add(helixObject, 'nbrSolids', 4, 150).listen().onChange(function (value) { createScene(); });
gui.add(helixObject, 'angle', Math.PI / 8, Math.PI).listen().onChange(function (value) { createScene(); });
gui.add(helixObject, 'distance', 0.2, 2).listen().onChange(function (value) { createScene(); });
gui.add(helixObject, 'radius', 1, 10).listen().onChange(function (value) { createScene(); });
gui.add(helixObject, 'type', ['Sphere', 'Tetrahedron', 'Octahedron', 'Icosahedron', 'Dodecahedron']).listen().onChange(function (value) { createScene(); });
gui.add(helixObject, 'color', ['Green', 'Blue', 'Red', 'Purple', 'Pink', 'White', 'Black']).listen().onChange(function (value) { createScene(); });


function createScene() {
    //clear objects on update.
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    //chose color.
    let c = new THREE.Color();
    if (helixObject.color == "Pink")
        c = new THREE.Color(1, .2, .8);
    else if (helixObject.color == "Blue")
        c = new THREE.Color(0, 0, 1);
    else if (helixObject.color == "Red")
        c = new THREE.Color(1, 0, 0);
    else if (helixObject.color == "Purple")
        c = new THREE.Color(.6, 0, .65);
    else if (helixObject.color == "Green")
        c = new THREE.Color(0, 1, 0);
    else if (helixObject.color == "White")
        c = new THREE.Color(1, 1, 1);
    else
        c = new THREE.Color(.01, .01, .01);

    //chose geometry.
    let geom = new THREE.Geometry();
    if (helixObject.type == "Sphere")
        geom = new THREE.SphereGeometry(1);
    else if (helixObject.type == "Tetrahedron")
        geom = new THREE.TetrahedronGeometry(1);
    else if (helixObject.type == "Octahedron")
        geom = new THREE.OctahedronGeometry(1);
    else if (helixObject.type == "Icosahedron")
        geom = new THREE.IcosahedronGeometry(1);
    else
        geom = new THREE.DodecahedronGeometry(1);

    let mat = new THREE.MeshLambertMaterial({ color: c });
    let thing = new THREE.Mesh(geom, mat);

    let helix = createHelix(thing, helixObject.nbrSolids, helixObject.radius, helixObject.angle, helixObject.distance);
    scene.add(helix);
    let light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 25, 20);
    scene.add(light);
    let light2 = new THREE.PointLight(0xffffff, .7, 100);
    light2.position.set(0, 25, -20);
    scene.add(light2);
}


function createHelix(object, n, radius, angle, dist) {
    let root = new THREE.Object3D();
    for (let i = 0, a = 0, height = 0; i < n; i++, a += angle, height += dist) {
        let s = new THREE.Object3D();
        s.rotation.y = a;
        let m = object.clone();
        m.position.x = radius;
        m.position.y = height;
        s.add(m);
        root.add(s);
    }
    return root;
}



function animate() {
    window.requestAnimationFrame(animate);
    render();
}


function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}


function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild(renderer.domElement);
}


init();
createScene();
addToDOM();
render();
animate();

