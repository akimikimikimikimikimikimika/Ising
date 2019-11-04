(()=>{let webgl=window.WebGLRenderingContext;let webgl2=window.WebGL2RenderingContext;let active=webgl||webgl2;let shaders=[{type:WebGL2RenderingContext.VERTEX_SHADER,code:`attribute vec3 position;uniform int pixel;varying float spin;void main() {vec2 p = position.xy/float(pixel);gl_Position = vec4(-1.0+p.x*2.0,+1.0-p.y*2.0,0.0,1.0);spin = position.z;}`},{type:WebGL2RenderingContext.FRAGMENT_SHADER,code:`precision mediump float;const vec4 off = vec4(0.4,0.4,0.0,1.0);const vec4 diff = vec4(0.6,0.6,0.6,0.0);varying float spin;void main() {gl_FragColor = off+diff*spin;}`}];let setup=()=>{if (!c) {c=document.createElement("canvas");c.id="view";ct=c.getContext(webgl2?"webgl2":"webgl");if (!ct) return true;if (initProgram()) return true;initVariables();o.artifact=c;}};let initProgram=()=>{pg=ct.createProgram();shaders.forEach(o=>{let s=ct.createShader(o.type);ct.shaderSource(s,o.code);ct.compileShader(s);ct.attachShader(pg,s);if (!ct.getShaderParameter(s, ct.COMPILE_STATUS)) {console.log(ct.getShaderInfoLog(s));return true;}});ct.linkProgram(pg);if (!ct.getProgramParameter(pg, ct.LINK_STATUS)) {console.log(ct.getProgramInfoLog(pg));return true;}};let initVariables=()=>{ct.useProgram(pg);pxl=ct.getUniformLocation(pg,"pixel");psb=ct.createBuffer();psl=ct.getAttribLocation(pg,"position");iab=ct.createBuffer();};let draw=()=>{ct.clearColor(0,0,0,0);ct.clear(ct.COLOR_BUFFER_BIT);ct.uniform1i(pxl,o.side);ct.bindBuffer(ct.ARRAY_BUFFER,psb);ct.bufferData(ct.ARRAY_BUFFER,ps,ct.STATIC_DRAW);ct.enableVertexAttribArray(psl);ct.vertexAttribPointer(psl,3,ct.FLOAT,false,0,0);ct.bindBuffer(ct.ELEMENT_ARRAY_BUFFER,iab);ct.bufferData(ct.ELEMENT_ARRAY_BUFFER,id,ct.STATIC_DRAW);ct.drawElements(ct.TRIANGLES,6*(o.side**2),ct.UNSIGNED_SHORT,0);};let updateData=a=>{let ia=a.map(sa=>sa.map(()=>[-1,-1,-1,-1]));let psa=[],ida=[];var idl=0;for (var x=0;x<o.side;x++) for (var y=0;y<o.side;y++) {var sat=false,sal=false;let ca=a[y][x],cia=ia[y][x];if (y>0) if (ca==a[y-1][x]) {cia[0]=ia[y-1][x][2];cia[1]=ia[y-1][x][3];sat=true;}if (!sat) {psa.push(x+1,y,ca);cia[1]=idl;idl++;}if (x>0) if (ca==a[y][x-1]) {cia[0]=ia[y][x-1][1];cia[2]=ia[y][x-1][3];sal=true;}if (!sal) {psa.push(x,y+1,ca);cia[2]=idl;idl++;}if (cia[0]<0) {psa.push(x,y,ca);cia[0]=idl;idl++;}psa.push(x+1,y+1,ca);cia[3]=idl;idl++;ida.push(cia[0],cia[1],cia[2],cia[1],cia[2],cia[3]);}ps=new Float32Array(psa),id=new Int16Array(ida);};let setViewport=()=>{let s=c.getBoundingClientRect();c.width=s.width*window.devicePixelRatio;c.height=s.height*window.devicePixelRatio;ct.viewport(0,0,c.width,c.height);ct.clearColor(0,0,0,0);ct.clear(ct.COLOR_BUFFER_BIT);};var c,ct,pg,ps,id,psl,pxl,psb,iab;let o={name:webgl2?"WebGL 2":"WebGL",active:false,artifact:null,drawPerBits:false,side:0,setup:setup,sideUpdate:()=>{},setScene:a=>{updateData(a);draw();},activated:setViewport,resized:()=>{setViewport();return true;}};window.res("webgl",active?[o]:[]);})();