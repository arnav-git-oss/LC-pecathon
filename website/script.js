gl_setup();

function gl_setup(){
    const canvas = document.getElementById("cvs");
    const wgl = canvas.getContext("webgl");

    if(!wgl){
        console.log("WebGL iniitiliazation failed");
        return;
    }

    wgl.clearColor(0.0, 0.0, 0.0, 1.0);
    wgl.clear(wgl.COLOR_BUFFER_BIT)
}