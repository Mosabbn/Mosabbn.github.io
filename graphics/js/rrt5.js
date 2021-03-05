
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function regularPolygonGeometry(n, innerColor, outerColor){
	var geom = new THREE.Geometry();
	const inc = 2.0*Math.PI/n;
	const r = 2.0;
	var innercolor_obj = new THREE.Color(innerColor);
	var outercolor_obj = new THREE.Color(outerColor);
	
    geom.vertices.push(new THREE.Vector3(0, 0, 1));  
	geom.vertices.push(new THREE.Vector3(0,r,1)); 	
	for(var i=1, a=inc ; i<n ; i++, a+=inc){
		geom.vertices.push(new THREE.Vector3(r*Math.sin(a), r*Math.cos(a), 1));
		var face = new THREE.Face3(i+1, i, 0);
		face.vertexColors.push(outercolor_obj);
		face.vertexColors.push(outercolor_obj);
		face.vertexColors.push(innercolor_obj);
		geom.faces.push(face);
	}
	var face = new THREE.Face3(n, 1, 0); 
	face.vertexColors.push(outercolor_obj);
	face.vertexColors.push(outercolor_obj);
	face.vertexColors.push(innercolor_obj);
	geom.faces.push(face);
   
	return geom;
}


function createScene() {
    // triangle geometry
    var mat = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors, side: THREE.DoubleSide })
    //  mesh
    var mesh = new THREE.Mesh(regularPolygonGeometry(8,'red','blue'), mat);

    scene.add(mesh);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0xFFFFFF, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 40);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function showGrids() {
    // Grid step size is 1; axes meet at (0,0,0)
	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
    Coordinates.drawAllAxes({axisLength:11, axisRadius:0.05});
}


function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}


//try {
	init();
    showGrids();
	createScene();
	addToDOM();
    render();
	animate();
	
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}

