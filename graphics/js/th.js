class Helper {
  constructor(gl) {
    this.gl = gl;
    this.vertexShader = null;
    this.fragmentShader = null;
    this.program = null;
    this.currentBuffer = {};
  }
  createShader(type, source) {
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.log(
        "failed to initialise shader : ",
        " ",
        this.gl.getShaderInfoLog(shader)
      );
    }
    return shader;
  }
  setVertexShader(source) {
    this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, source);
    return this.vertexShader;
  }
  setFragmentShader(source) {
    this.fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, source);
    return this.fragmentShader;
  }
  bind() {
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.log("linker failed", " ", this.gl.getProgramInfoLog(this.program));
    }
    this.gl.useProgram(this.program);
    return this.program;
  }
  createBuffer(type, array, drawType) {
    var buf = this.gl.createBuffer();
    this.gl.bindBuffer(type, buf);
    this.gl.bufferData(type, new Float32Array(array), drawType);
    this.currentBuffer.object = buf;
    this.currentBuffer.type = type;
    return this.currentBuffer;
  }
  getAttrib(attrib) {
    var attr = this.gl.getAttribLocation(this.program, attrib);
    return attr;
  }
  setAttrib(attr, value, buf) {
    if (buf && buf.object != this.currentBuffer.object) {
      this.gl.bindBuffer(buf.type, buf.object);
    }
    buf && this.gl.bindBuffer(buf.type, buf.object);
    this.gl.vertexAttribPointer(
      attr,
      value.size,
      this.gl.FLOAT,
      this.gl.FALSE,
      value.totalSize,
      value.offsetSize
    );
  }
  enableAttrib(attrib) {
    this.gl.enableVertexAttribArray(attrib);
  }
  getUniform(name) {
    var unif = this.gl.getUniformLocation(this.program, name);
    return unif;
  }
  setUniform(unif, value) {
    this.gl.uniformMatrix4fv(unif, this.gl.false, value);
  }
  setUniformVec(unif, value) {
    this.gl.uniform2f(unif, ...value);
  }
  draw(func) {
    func();
  }
}

var can = document.getElementById("can");
var gl = can.getContext("webgl") || can.getContext("experimental-webgl");
var triangles = [];
var g = new Helper(gl);
var rx = 0,
  ry = 90,
  rz = -360,
  clicked = {};
var settings = {
  base:1,
  redraw:draw_it,
  level:6,
  zoom:-5.5,
  mode:gl.TRIANGLES
}
if (can.addEventListener){
    can.addEventListener("mousewheel", MouseWheelHandler, false);
    can.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
}
else{
    can.attachEvent("onmousewheel", MouseWheelHandler);
}
 
function MouseWheelHandler(e){
    var e = window.event || e; 
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  settings.zoom += delta/5;
  settings.zoom = Math.max(settings.zoom,-10);
  settings.zoom = Math.min(settings.zoom,1);
  draw();
    return false;
}
var t;
function resize() {
  can.width = window.innerWidth;
  can.height = window.innerHeight;
    gl.viewport(0, 0,
      gl.drawingBufferWidth, gl.drawingBufferHeight);
  clearTimeout();
  t = setTimeout(function(){
    draw_it();
  },1000);
}

can.onmousemove = function(e) {
  if (clicked.down) {
    var left = clicked.coord[0] - e.clientX;
    var top = clicked.coord[1] - e.clientY;
    clicked.coord[0] = e.clientX;
    clicked.coord[1] = e.clientY;
    rz += left / 5;
    ry += top / 5;
    draw();
  }
};
can.ontouchmove = function(e) {
  if (clicked.down) {
    var left = clicked.coord[0] - e.touches[0].clientX;
    var top = clicked.coord[1] - e.touches[0].clientY;
    clicked.coord[0] = e.touches[0].clientX;
    clicked.coord[1] = e.touches[0].clientY;
    rz += left / 5;
    ry += top / 5;
    if(ry%360 <-90) {
      direction = 1;
      if(rz > 0) rz = -rz;
    }else {
      direction = -1;
      if(rz < 0) rz = -rz;
    }
    draw();
  }
};
can.ontouchstart = function(e) {
  clicked.down = true;
  clicked.coord = [e.touches[0].clientX, e.touches[0].clientY];
};
can.ontouchend = function() {
  clicked.down = false;
};
can.onmousedown = function(e) {
  clicked.down = true;
  clicked.coord = [e.clientX, e.clientY];
};
can.onmouseup = function() {
  clicked.down = false;
};

var vertexShader = `
    precision highp float;
    attribute vec3 pos;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 proj;

    varying vec3 col;
    void main(){
        col = 0.5*pos+vec3(0.5,0.5,0.5);
        gl_Position = proj * view * model * vec4(pos,1.0);
        gl_PointSize = 5.0;
    }
`;
var fragmentShader = `
    precision highp float;
    varying vec3 col;
    void main(){
            gl_FragColor = vec4(col,1.0);
    }
`;
g.setVertexShader(vertexShader);
g.setFragmentShader(fragmentShader);
g.bind();
gl.enable(gl.DEPTH_TEST);

var proj = g.getUniform("proj");
var view = g.getUniform("view");
var p = new Float32Array(16);
var v = new Float32Array(16);
mat4.lookAt(v, [0, 0, settings.zoom], [0, 0, 3.0], [0, 1, 0]);
mat4.perspective(p, 0.5, can.width / can.height, 0.1, 10000);
var m = new Float32Array(16);

resize();
window.onresize = resize;

function sierpinski(coords, limit) {
  if (--limit) {
    if (coords.length == 4) {
      var x12 = (coords[0].x + coords[1].x) / 2;
      var y12 = (coords[0].y + coords[1].y) / 2;
      var z12 = (coords[0].z + coords[1].z) / 2;

      var x13 = (coords[0].x + coords[2].x) / 2;
      var y13 = (coords[0].y + coords[2].y) / 2;
      var z13 = (coords[0].z + coords[2].z) / 2;

      var x14 = (coords[0].x + coords[3].x) / 2;
      var y14 = (coords[0].y + coords[3].y) / 2;
      var z14 = (coords[0].z + coords[3].z) / 2;

      var x23 = (coords[1].x + coords[2].x) / 2;
      var y23 = (coords[1].y + coords[2].y) / 2;
      var z23 = (coords[1].z + coords[2].z) / 2;

      var x24 = (coords[1].x + coords[3].x) / 2;
      var y24 = (coords[1].y + coords[3].y) / 2;
      var z24 = (coords[1].z + coords[3].z) / 2;

      var x34 = (coords[2].x + coords[3].x) / 2;
      var y34 = (coords[2].y + coords[3].y) / 2;
      var z34 = (coords[2].z + coords[3].z) / 2;

      sierpinski(
        [
          coords[0],
          {
            x: x12,
            y: y12,
            z: z12
          },
          {
            x: x13,
            y: y13,
            z: z13
          },
          {
            x: x14,
            y: y14,
            z: z14
          }
        ],
        limit
      );
      sierpinski(
        [
          {
            x: x12,
            y: y12,
            z: z12
          },
          coords[1],
          {
            x: x23,
            y: y23,
            z: z23
          },
          {
            x: x24,
            y: y24,
            z: z24
          }
        ],
        limit
      );
      sierpinski(
        [
          {
            x: x13,
            y: y13,
            z: z13
          },
          {
            x: x23,
            y: y23,
            z: z23
          },
          coords[2],
          {
            x: x34,
            y: y34,
            z: z34
          }
        ],
        limit
      );
      sierpinski(
        [
          {
            x: x14,
            y: y14,
            z: z14
          },
          {
            x: x24,
            y: y24,
            z: z24
          },
          {
            x: x34,
            y: y34,
            z: z34
          },
          coords[3]
        ],
        limit
      );
    } else {
      var x12 = (coords[0].x + coords[1].x) / 2;
      var y12 = (coords[0].y + coords[1].y) / 2;
      var z12 = (coords[0].z + coords[1].z) / 2;

      var x13 = (coords[0].x + coords[2].x) / 2;
      var y13 = (coords[0].y + coords[2].y) / 2;
      var z13 = (coords[0].z + coords[2].z) / 2;

      var x14 = (coords[0].x + coords[3].x) / 2;
      var y14 = (coords[0].y + coords[3].y) / 2;
      var z14 = (coords[0].z + coords[3].z) / 2;

      var x15 = (coords[0].x + coords[4].x) / 2;
      var y15 = (coords[0].y + coords[4].y) / 2;
      var z15 = (coords[0].z + coords[4].z) / 2;

      var x23 = (coords[1].x + coords[2].x) / 2;
      var y23 = (coords[1].y + coords[2].y) / 2;
      var z23 = (coords[1].z + coords[2].z) / 2;

      var x25 = (coords[1].x + coords[4].x) / 2;
      var y25 = (coords[1].y + coords[4].y) / 2;
      var z25 = (coords[1].z + coords[4].z) / 2;

      var x34 = (coords[2].x + coords[3].x) / 2;
      var y34 = (coords[2].y + coords[3].y) / 2;
      var z34 = (coords[2].z + coords[3].z) / 2;

      var x45 = (coords[3].x + coords[4].x) / 2;
      var y45 = (coords[3].y + coords[4].y) / 2;
      var z45 = (coords[3].z + coords[4].z) / 2;

      sierpinski(
        [
          coords[0],
          {
            x: x12,
            y: y12,
            z: z12
          },
          {
            x: x13,
            y: y13,
            z: z13
          },
          {
            x: x14,
            y: y14,
            z: z14
          },
          {
            x: x15,
            y: y15,
            z: z15
          }
        ],
        limit
      );
      var base_mid_x = (x25 + x34) / 2;
      var base_mid_y = (y25 + y34) / 2;
      var base_mid_z = (z25 + z34) / 2;
      sierpinski(
        [
          {
            x: x12,
            y: y12,
            z: z12
          },
          coords[1],
          {
            x: x23,
            y: y23,
            z: z23
          },
          {
            x: base_mid_x,
            y: base_mid_y,
            z: base_mid_z
          },
          {
            x: x25,
            y: y25,
            z: z25
          }
        ],
        limit
      );
      sierpinski(
        [
          {
            x: x13,
            y: y13,
            z: z13
          },
          {
            x: x23,
            y: y23,
            z: z23
          },
          coords[2],
          {
            x: x34,
            y: y34,
            z: z34
          },
          {
            x: base_mid_x,
            y: base_mid_y,
            z: base_mid_z
          }
        ],
        limit
      );
      sierpinski(
        [
          {
            x: x14,
            y: y14,
            z: z14
          },
          {
            x: base_mid_x,
            y: base_mid_y,
            z: base_mid_z
          },
          {
            x: x34,
            y: y34,
            z: z34
          },
          coords[3],
          {
            x: x45,
            y: y45,
            z: z45
          }
        ],
        limit
      );

      sierpinski(
        [
          {
            x: x15,
            y: y15,
            z: z15
          },
          {
            x: x25,
            y: y25,
            z: z25
          },
          {
            x: base_mid_x,
            y: base_mid_y,
            z: base_mid_z
          },
          {
            x: x45,
            y: y45,
            z: z45
          },
          coords[4]
        ],
        limit
      );
    }
  } else {
    if (coords.length == 4) {
      triangles.push(
        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[1].x,
        coords[1].y,
        coords[1].z,
        coords[2].x,
        coords[2].y,
        coords[2].z,

        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[2].x,
        coords[2].y,
        coords[2].z,
        coords[3].x,
        coords[3].y,
        coords[3].z,

        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[3].x,
        coords[3].y,
        coords[3].z,
        coords[1].x,
        coords[1].y,
        coords[1].z
      );
    } else {
      triangles.push(
        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[1].x,
        coords[1].y,
        coords[1].z,
        coords[2].x,
        coords[2].y,
        coords[2].z,
        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[2].x,
        coords[2].y,
        coords[2].z,
        coords[3].x,
        coords[3].y,
        coords[3].z,
        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[3].x,
        coords[3].y,
        coords[3].z,
        coords[4].x,
        coords[4].y,
        coords[4].z,
        coords[0].x,
        coords[0].y,
        coords[0].z,
        coords[4].x,
        coords[4].y,
        coords[4].z,
        coords[1].x,
        coords[1].y,
        coords[1].z
      );
    }
  }
}


g.setUniform(view, v);
g.setUniform(proj, p);
var direction = 1;
function gui(){
  var g = new dat.GUI();
  g.add(settings,'level',1,9).step(1);
  g.add(settings,'base',{triangle:0,square:1});
  g.add(settings,'redraw');
  g.add(settings,'zoom',-10,1).listen();
  g.add(settings,'mode',{
    triangles:gl.TRIANGLES,
    lines:gl.LINES,
    points:gl.POINTS
  });
}
gui();
function draw_it() {
  zoom = -5.5;
  triangles = [];
  settings.base *= 1;
  if (!settings.base) {
    ry = 0;
    rz = 180;
    direction = 1;
    sierpinski(
      [
        {
          x: 0.0,
          y: 1.0,
          z: 0.0
        },
        {
          x: -1.0,
          y: -1.0,
          z: -1.0
        },
        {
          x: 1.0,
          y: -1.0,
          z: -1.0
        },
        {
          x: 0,
          y: -1.0,
          z: 1.0
        }
      ],
      settings.level
    );
  } else {
    ry = 0;
    rz = -90;
    direction = -1;
    sierpinski(
      [
        {
          x: 0.0,
          y: 1.0,
          z: 0.0
        },
        {
          x: -1.0,
          y: -1.0,
          z: -1.0
        },
        {
          x: 1.0,
          y: -1.0,
          z: -1.0
        },
        {
          x: 1.0,
          y: -1.0,
          z: 1.0
        },
        {
          x: -1.0,
          y: -1.0,
          z: 1.0
        }
      ],
      settings.level
    );
  }
  draw();
}
draw_it();

function draw() {
  var yrot = new Float32Array(16);
  var zrot = new Float32Array(16);
  mat4.identity(yrot);
  mat4.identity(zrot);
  mat4.fromRotation(yrot, glMatrix.toRadian(ry), [1, 0, 0]);
  mat4.fromRotation(zrot, glMatrix.toRadian(direction*rz), [0, 1, 0]);
  mat4.mul(m, yrot, zrot);
  mat4.lookAt(v, [0, 0, settings.zoom], [0, 0, 3.0], [0, 1, 0]);
  g.setUniform(view, v);
  var model = g.getUniform("model");
  g.setUniform(model, m);

  g.createBuffer(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
  var pos = g.getAttrib("pos");
  g.setAttrib(pos, {
    size: 3,
    totalSize: 3 * Float32Array.BYTES_PER_ELEMENT,
    offsetSize: 0
  });
  g.enableAttrib(pos);

  gl.clearColor(1.0, 1.0, 1.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(settings.mode, 0, triangles.length / 3);
}
// setInterval(
// draw,1000);
draw();