wgl_setup();
let cubeRotation = 0.0;
let deltaTime = 0;

function wgl_setup(){
    const canvas = document.getElementById("cvs");
    const wgl = canvas.getContext("webgl");

    if(!wgl){
        console.log("WebGL iniitiliazation failed");
        return;
    }

    const vertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(){
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
   `;

    const fragShader = `
    varying lowp vec4 vColor;
    void main(){
        gl_FragColor = vColor;
    }
    `;


    shaders = wgl_shader_init(wgl, vertexShader, fragShader);

        const shaderInfo = {
        program: shaders,
        attribLocations: {
            vertexPosition: wgl.getAttribLocation(shaders, "aVertexPosition"),
            vertexColor: wgl.getAttribLocation(shaders, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: wgl.getUniformLocation(shaders, "uProjectionMatrix"),
            modelViewMatrix: wgl.getUniformLocation(shaders, "uModelViewMatrix"),
        },
    };

    const buffers = initBuffers(wgl);
    let then = 0;

    function render(now){
        now *= 0.001;
        deltaTime = now - then;
        then = now;

        wgl_draw(wgl, shaderInfo, buffers, cubeRotation);
        cubeRotation += deltaTime

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function wgl_shader_init(wgl, vertexShaderglsl, fragShaderglsl){

    const verts = loadShader(wgl, wgl.VERTEX_SHADER, vertexShaderglsl);
    const frags = loadShader(wgl, wgl.FRAGMENT_SHADER, fragShaderglsl);

    const shaders = wgl.createProgram();
    wgl.attachShader(shaders, verts);
    wgl.attachShader(shaders, frags);
    wgl.linkProgram(shaders);

    if(!wgl.getProgramParameter(shaders, wgl.LINK_STATUS)){
        console.log("Failed to initialise shaders");
        return;
    }

    return shaders;
}

function initBuffers(wgl){
    const positionBuffer = initPositionBuffer(wgl);
    const colorBuffer = initColorBuffer(wgl);
    const indexBuffer = initIndexBuffer(wgl);

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function initPositionBuffer(wgl){
    const positionBuffer = wgl.createBuffer();
    wgl.bindBuffer(wgl.ARRAY_BUFFER, positionBuffer);

    const positions = [
  // Front face
  -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

  // Back face
  -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

  // Top face
  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

  // Right face
  1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

  // Left face
  -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];

    wgl.bufferData(wgl.ARRAY_BUFFER, new Float32Array(positions), wgl.STATIC_DRAW);

    return positionBuffer
}

function loadShader(wgl, type, source){
    const shader = wgl.createShader(type);
    wgl.shaderSource(shader, source);
    wgl.compileShader(shader);

    return shader;
}

function wgl_draw(wgl, programInfo, buffers, cubeRotation){
    //Screen Clear
    wgl.clearColor(0.0, 0.0, 0.0, 1.0);
    wgl.clearDepth(1.0);
    wgl.enable(wgl.DEPTH_TEST);
    wgl.depthFunc(wgl.LEQUAL);
    wgl.clear(wgl.COLOR_BUFFER_BIT | wgl.DEPTH_BUFFER_BIT);

    const fov = (45 * Math.PI) / 180;
    const aspect = wgl.canvas.clientWidth / wgl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);

    const modelViewMatrix =  mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0],);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0,0,1],);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [0,1,0],);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.3, [1,0,0],);

    setPositionAttribute(wgl, buffers, programInfo);
    setColorAttribute(wgl, buffers, programInfo);

    wgl.bindBuffer(wgl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    wgl.useProgram(programInfo.program);

    wgl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix,);
    wgl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix,);

    {
        const offset = 0;
        const vertexCount = 36;
        const type = wgl.UNSIGNED_SHORT;
        wgl.drawElements(wgl.TRIANGLES, vertexCount, type, offset);
    }
}

function setPositionAttribute(wgl, buffers, programInfo){
    const numComponents = 3;
    const type = wgl.FLOAT;
    const normalize = false;
    const stride = 0;

    const offset = 0;

    wgl.bindBuffer(wgl.ARRAY_BUFFER, buffers.position);
    wgl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    wgl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function setColorAttribute(wgl, buffers, programInfo){
    const numComponents = 4;
    const type = wgl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    wgl.bindBuffer(wgl.ARRAY_BUFFER, buffers.color);
    wgl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    wgl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}
function initColorBuffer(wgl){
    const faceColors = [
  [1.0, 1.0, 1.0, 1.0], // Front face: white
  [1.0, 0.0, 0.0, 1.0], // Back face: red
  [0.0, 1.0, 0.0, 1.0], // Top face: green
  [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
  [1.0, 1.0, 0.0, 1.0], // Right face: yellow
  [1.0, 0.0, 1.0, 1.0], // Left face: purple
];

// Convert the array of colors into a table for all the vertices.

let colors = [];

for (const c of faceColors) {
  // Repeat each color four times for the four vertices of the face
  colors = colors.concat(c, c, c, c);
}

    const colorBuffer = wgl.createBuffer();
    wgl.bindBuffer(wgl.ARRAY_BUFFER, colorBuffer);
    wgl.bufferData(wgl.ARRAY_BUFFER, new Float32Array(colors), wgl.STATIC_DRAW);

    return colorBuffer;
}

function initIndexBuffer(wgl){
    const indexBuffer = wgl.createBuffer();
    wgl.bindBuffer(wgl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
     0,  1,  2,      0,  2,  3,    // front
     4,  5,  6,      4,  6,  7,    // back
     8,  9,  10,     8,  10, 11,   // top
     12, 13, 14,     12, 14, 15,   // bottom
     16, 17, 18,     16, 18, 19,   // right
     20, 21, 22,     20, 22, 23,   // left
  ];

  wgl.bufferData(wgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), wgl.STATIC_DRAW,);

  return indexBuffer;
}