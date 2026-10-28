wgl_setup();

function wgl_setup(){
    const canvas = document.getElementById("cvs");
    const wgl = canvas.getContext("webgl");

    if(!wgl){
        console.log("WebGL iniitiliazation failed");
        return;
    }

    const vertexShader = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(){
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
   `;

    const fragShader = `
    void main(){
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    `;


    shaders = wgl_shader_init(wgl, vertexShader, fragShader);

        const shaderInfo = {
        program: shaders,
        attribLocations: {
            vertexPosition: wgl.getAttribLocation(shaders, "aVertexPosition"),
        },
        uniformLocations: {
            projectionMatrix: wgl.getUniformLocation(shaders, "uProjectionMatrix"),
            modelViewMatrix: wgl.getUniformLocation(shaders, "uModelViewMatrix"),
        },
    };

    const buffers = initBuffers(wgl);
    wgl_draw(wgl, shaderInfo, buffers);
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

    return {
        position: positionBuffer,
    };
}

function initPositionBuffer(wgl){
    const positionBuffer = wgl.createBuffer();
    wgl.bindBuffer(wgl.ARRAY_BUFFER, positionBuffer);

    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    wgl.bufferData(wgl.ARRAY_BUFFER, new Float32Array(positions), wgl.STATIC_DRAW);

    return positionBuffer
}

function loadShader(wgl, type, source){
    const shader = wgl.createShader(type);
    wgl.shaderSource(shader, source);
    wgl.compileShader(shader);

    return shader;
}

function wgl_draw(wgl, programInfo, buffers){
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

    setPositionAttribute(wgl, buffers, programInfo);

    wgl.useProgram(programInfo.program);

    wgl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix,);
    wgl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix,);

    {
        const offset = 0;
        const vertexCount = 4;
        wgl.drawArrays(wgl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

function setPositionAttribute(wgl, buffers, programInfo){
    const numComponents = 2;
    const type = wgl.FLOAT;
    const normalize = false;
    const stride = 0;

    const offset = 0;

    wgl.bindBuffer(wgl.ARRAY_BUFFER, buffers.position);
    wgl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    wgl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}