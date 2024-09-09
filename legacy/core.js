(()=>{var status,renderer;let ce=t=>document.createElement(t),cd=(i,t)=>{let d=ce("div");if (i) d.id=i;if (t) d.textContent=t;return d;},ap=(p,c)=>p.appendChild(c),rc=c=>c.parentNode.removeChild(c),sa=(e,k,v)=>e.setAttribute(k,v),ra=(e,k)=>e.removeAttribute(k),ael=(e,t,f)=>e.addEventListener(t,f),sc=(e,c)=>{if (c) sa(e,"class",c);else ra(e,"class");return e;};let a=[],od=[],c=ap(cd("container"),cd("frame"));let message=(()=>{var e=null;let o={name:"Message",artifact:null,setup:()=>{e=cd("view");sc(e,"message");o.artifact=e;},text:t=>e.textContent=t};return o;})();var int=null,last=null;var o=null;let calc=()=>{{let a=[];while (od.length) {let i=rand(od.length);a.push(od[i]);od.splice(i,1);}for (var n=0;n<a.length;n++) od.push(a[n]);}let s=status.side;let T=status.T,J=status.J,H=status.H;let b=(x,y)=>{return a[(y+s)%s][(x+s)%s]*2-1;};var pb=0;for (var n=0;n<od.length;n++) {let ps={x:od[n]%s,y:Math.floor(od[n]/s)};var hm=H;[[-1,0],[+1,0],[0,-1],[0,+1]].forEach(p=>hm+=J*b(ps.x+p[0],ps.y+p[1]));if (T==0) pb=(Math.sign(hm)+1)/2;else pb=1/(1+Math.exp(-2*hm/T));let v=rand()<pb;if (o.drawPerBits&&(a[ps.y][ps.x]!=v)) {if (!status.failed) o.setBit(ps.x,ps.y,v);}a[ps.y][ps.x]=v;}if (!o.drawPerBits) o.setScene(a);};let rendererUpdate=m=>{pause();var r;if (m) r=m;else r=renderer[status.render];if (o) {if (o.artifact) rc(o.artifact);o.active=false;}o=r;let f=rs=>{if (rs) {message.text("Loading failed");rendererUpdate(message);status.failed=true;}else {status.failed=false;ap(c,o.artifact);o.active=true;if (!m) {let s=status.side;o.side=s;o.activated();o.sideUpdate(0,s);if (o.drawPerBits) for (var x=0;x<s;x++) for (var y=0;y<s;y++) o.setBit(x,y,a[y][x]);else o.setScene(a);if ((status.side>0)&&(!status.paused)) resume();}}};if (o.asynchronousSetup) o.setup().then(f);else f(o.setup());};let sideUpdate=(()=>{let cp=()=>a.map(v=>Array.from(v));return w=>{pause();let ns=status.side;if (a.length) var os=a[0].length;else var os=0;if (os) {if (os<ns) {let b=cp();a.length=0;for (var y=0;y<ns;y++) {let yr=y*(os-1)/(ns-1);let yi=[Math.floor(yr),Math.ceil(yr)];let sa=[];a.push(sa);for (var x=0;x<ns;x++) {let xr=x*(os-1)/(ns-1);let xi=[Math.floor(xr),Math.ceil(xr)];var num=0,den=0;xi.forEach(x=>yi.forEach(y=>{let p=(1-Math.abs(xr-x))*(1-Math.abs(yr-y));den+=p;num+=p*b[y][x];}));sa.push((num/den)>=0.5);}}}if (os>ns) {let b=cp();a.length=0;let p=[];for (var m=0;m<ns;m++) p.push([m*(os-1)/(ns-1)]);for (var n=0;n<os;n++) {let r=n*(ns-1)/(os-1);let i=[Math.floor(r),Math.ceil(r)];if (i[0]==i[1]) p[r].push(n);else i.forEach(i=>p[i].push(n));}for (var y=0;y<ns;y++) {let yi=p[y];let sa=[];a.push(sa);for (var x=0;x<ns;x++) {let xi=p[x];var num=0,den=0;yi.forEach((y,i)=>{if (i) xi.forEach((x,i)=>{if (i) {let p=(1-Math.abs((xi[0]-x)*(ns-1)/(os-1)))*(1-Math.abs((yi[0]-y)*(ns-1)/(os-1)));den+=p;num+=p*b[y][x];}});});sa.push((num/den)>=0.5);}}}}else {for (var y=0;y<ns;y++) {let sa=[];a.push(sa);for (var x=0;x<ns;x++) sa.push(rand()<0.5);}}if (os!=ns) {let cl=status.side**2;while (od.length!=cl) {if (od.length<cl) od.splice(rand(od.length),0,od.length);else od.splice(od.findIndex(v=>v==(od.length-1)),1);}if (!w) {o.side=ns;if (!status.failed) o.sideUpdate(os,ns);if (o.drawPerBits) for (var x=0;x<ns;x++) for (var y=0;y<ns;y++) o.setBit(x,y,a[y][x]);else o.setScene(a);}}if ((!status.paused)&&(!status.failed)) resume();};})();let rand=(()=>{let m=256;var a=null,p=m;let crng=()=>{if (!a) a=new Uint32Array(m);if (p>=m) {window.crypto.getRandomValues(a);p=0;}var r=a[p]/4294967295;p++;return r;};let nrng=()=>Math.random();let get=()=>{if (status.cryptoRng) return crng();else return nrng();};return (s)=>{if (s!=undefined) return Math.floor(get()*s);else return get();};})();let pause=()=>{if (int) window.cancelAnimationFrame(int);int=last=null;};let resume=()=>{if (!int) {let f=()=>{let d=new Date();if (last) {if ((d-last)>=100) {calc();last=d;}}else last=d;int=window.requestAnimationFrame(f);};f();}};let resized=()=>{pause();let s=status.side;if (!status.failed) {if (o.resized()) {if (o.drawPerBits) for (var x=0;x<s;x++) for (var y=0;y<s;y++) o.setBit(x,y,a[y][x]);else o.setScene(a);}if (!status.paused) resume();}};ael(window,"resize",resized);window.res("core",(s,r,b)=>{status=s,renderer=r;sideUpdate(true);ap(b,c.parentNode);if (renderer.length>0) rendererUpdate();else {rendererUpdate(message);status.failed=true;message.text("No renderer available");}resized();return {sideUpdate:sideUpdate,rendererUpdate:rendererUpdate,pause:pause,resume:resume};});})();