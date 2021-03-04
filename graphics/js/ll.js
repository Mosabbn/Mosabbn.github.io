// loading canvas element
let canvas = document.getElementById('canvas')
canvas.width = 600
canvas.height = 600
let gl = canvas.getContext('webgl')
gl.enable(gl.DEPTH_TEST)

let baseColors = [
  [1.0, 0.0, 0.36],
  [0.61, 1.0, 0.3],
  [1.0, 0.52, 0.14],
  [1.0, 0.0, 1.0]
]

// creating a simple series of points
let vertices = [
   [0.0000,  -0.1500, -1.0000],
   [0.0000,  0.8428,  0.3333],
   [-0.8165, -0.5714,  0.3333],
   [0.8165, -0.5714,  0.3333]
]
let points = []
let colors = []

function flatten(array) {
  let f = new Float32Array(array.length*3)
  array.forEach(function (point, index) {
    f[index*3] = point[0]
    f[index*3+1] = point[1]
    f[index*3+2] = point[2]
  })
  return f
}


// utility to scale a vector
function scale(point, scale) {
  return [point[0]*scale, point[1]*scale, point[2]*scale]
}


function triangle (a, b, c, color) {
  colors.push(scale(baseColors[color], 1))
  points.push(a)
  colors.push(scale(baseColors[color], 1))
  points.push(b)
  colors.push(baseColors[color])
  points.push(c)
}

function tetra (a, b, c, d) {
  triangle(a, c, b, 0)
  triangle(a, c, d, 1)
  triangle(a, b, d, 2)
  triangle(b, c, d, 3)
}

function getMiddlePoint(u, v){
   return [0.5*(u[0] + v[0]), 0.5* (u[1] + v[1]), 0.5* (u[2] + v[2])]
}


function divideTetra(a, b, c, d, count) {
  if(count===0){
    tetra(a, b, c, d)
    return
  }
  let ab = getMiddlePoint(a, b)
  let ac = getMiddlePoint(a, c)
  let ad = getMiddlePoint(a, d)
  let bc = getMiddlePoint(b, c)
  let bd = getMiddlePoint(b, d)
  let cd = getMiddlePoint(c, d)
  --count
  divideTetra(a, ab, ac, ad, count)
  divideTetra(ab, b, bc, bd, count)
  divideTetra(ac, bc, c, cd, count)
  divideTetra(ad, bd, cd, d, count)
}


// loading vertex and fragment shaders
let vertex = document.getElementById('vertex-shader')
let vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vertex.text)
gl.compileShader(vertexShader)

let fragment = document.getElementById('fragment-shader')
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, fragment.text)
gl.compileShader(fragmentShader)

// initializing gl program
let program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)

gl.clearColor(0.0, 0.0, 0.0, 1.0)

gl.useProgram(program)


divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], 3)

// webgl data
let colorBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)


let vColor = gl.getAttribLocation(program, 'vColor')
gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(vColor)

let pointBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer)
gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)


let vPosition = gl.getAttribLocation(program, 'vPosition')
gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(vPosition)


// render

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, points.length)
}

draw()
