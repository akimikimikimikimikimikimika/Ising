class DrawScene {static get inputProperties(){return ["--binary-data","--on-color","--off-color"];}paint(ct,rect,props){let p=id=>props.get(id).toString();var d=p("--binary-data");let on=p("--on-color"),off=p("--off-color");d=d.match(/[01]+/)[0];let s=d.length**0.5;ct.clearRect(0,0,rect.width,rect.height);if (s%1==0) {let a=[];for (var n=0;n<=s;n++) a.push({x:Math.round(n*rect.width/s),y:Math.round(n*rect.height/s)});for (var x=0;x<s;x++) for (var y=0;y<s;y++) {ct.beginPath();ct.rect(a[x].x,a[y].y,a[x+1].x-a[x].x,a[y+1].y-a[y].y);ct.fillStyle=d[x+y*s]=="1"?on:off;ct.fill();}}}}registerPaint("scene",DrawScene);