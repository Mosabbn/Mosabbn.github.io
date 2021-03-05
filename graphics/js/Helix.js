let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();


function createScene() {
    let geom = new THREE.Geometry();
    if (helixObj.shape == "Sphere")
        geom = new THREE.SphereGeometry(1, 12, 12);

    let mat = new THREE.MeshLambertMaterial({ color: 'blue' });
    let met = new THREE.Mesh(geom, mat);
    let helix = createHelix(met, helixObj.nbrSolids, helixObj.radius, helixObj.angle, helixObj.distance);
    let light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(1, 30, 20);
    let light2 = new THREE.PointLight(0xffffff, .7, 100);
    light2.position.set(0, 25, -20);
    scene.add(helix);
    scene.add(light);
    scene.add(light2);
}

const helixObj = { 
					shape: "Sphere", 
					radius: 2, 
					nbrSolids: 49, 
					angle: Math.PI / 4, 
					distance: 0.5
				};

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
    camera = new THREE.PerspectiveCamera(50, canvasRatio, 1, 1000);
    camera.position.set(30, 30, 30);
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
