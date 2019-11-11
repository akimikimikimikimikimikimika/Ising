(()=>{let active=navigator.gpu&&GPUBufferUsage.COPY_SRC!==undefined;var c,ct,dev,rp,vb,sc,rpd;let setup=async ()=>{if (!c) {c=document.createElement("canvas");c.id="view";ct=c.getContext("gpu");if (!ct) return true;await prepare();o.artifact=c;}};let prepare=async ()=>{let a=await navigator.gpu.requestAdapter();dev=await a.requestDevice();let sm=dev.createShaderModule({code: `struct FragmentData {float4 position : SV_Position;float4 color : attribute(2);}vertex FragmentData vertexMain(float2 coord : attribute(0), float bit : attribute(1)) {FragmentData out;out.position = float4(coord,0.0,1.0);out.color = float4(0.4,0.4,0.0,1.0)+float4(0.6,0.6,0.6,0.0)*bit;return out;}fragment float4 fragmentMain(float4 color : attribute(2)) : SV_Target 0 {return color;}`,isWHLSL: true});rp=dev.createRenderPipeline({vertexStage: {module: sm,entryPoint: "vertexMain"},fragmentStage: {module: sm,entryPoint: "fragmentMain"},primitiveTopology: "triangle-list",colorStates: [{format: "bgra8unorm",alphaBlend: {srcFactor: "one",dstFactor: "zero",operation: "add"},colorBlend: {srcFactor: "one",dstFactor: "zero",operation: "add"},writeMask: GPUColorWrite.ALL}],vertexInput: {vertexBuffers: [{stride: 3*4,attributeSet: [{shaderLocation: 0,offset: 0,format: "float2"},{shaderLocation: 1,offset: 2*4,format: "float"}]}]}});sc=ct.configureSwapChain({device: dev,format: "bgra8unorm"});rpd={colorAttachments:[{attachment:null,loadOp:"clear",storeOp:"store",clearColor:{r:0,g:0,b:0,a:0}}]};};let draw=()=>{rpd.colorAttachments[0].attachment=sc.getCurrentTexture().createDefaultView();let ce=dev.createCommandEncoder();let rpe=ce.beginRenderPass(rpd);rpe.setPipeline(rp);rpe.setVertexBuffers(0,[vb],[0]);rpe.draw((p**2)*6,1,0,0);rpe.endPass();let cb=ce.finish();dev.getQueue().submit([cb]);};var p;let fr=[[0,0],[0,1],[1,0],[0,1],[1,0],[1,1]];let updateData=async a=>{let d=[];p=a.length;let c=v=>v/p*2-1;for (var x=0;x<p;x++) for (var y=0;y<p;y++) fr.forEach(f=>d.push(c(x+f[0]),-c(y+f[1]),a[y][x]));let ab=await vb.mapWriteAsync();let fa=new Float32Array(ab);fa.set(d);vb.unmap();};let sideUpdate=(b,a)=>{p=a;vb=dev.createBuffer({size:(p**2)*6*3*4,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.VERTEX});};let setViewport=()=>{let r=c.getBoundingClientRect(),dpr=window.devicePixelRatio;c.width=r.width*dpr;c.height=r.height*dpr;};let o={name:"WebGPU",active:false,artifact:null,drawPerBits:false,side:0,asynchronousSetup:true,setup:setup,sideUpdate:sideUpdate,setScene:async a=>{await updateData(a);draw();},activated:setViewport,resized:()=>{setViewport();draw();return true;}};window.res("webgpu",active?[o]:[]);})();