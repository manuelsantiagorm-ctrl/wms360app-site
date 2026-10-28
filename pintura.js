// Pintura por capas de pinceladas, guiadas por el color de la obra original.
window.PastelPainter = (() => {
  const DURATION = 7600;
  function randomGenerator(seed = 9167) {
    return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function schedule(width, height) {
    const random = randomGenerator();
    const layers = [{size:64,count:600,end:.22},{size:27,count:1800,end:.55},{size:10,count:4800,end:1}];
    const strokes = [];
    let start = 0;
    for (const layer of layers) {
      for (let i=0;i<layer.count;i++) {
        strokes.push({x:random()*width,y:random()*height,size:layer.size,
          angle:random()*Math.PI,when:start+(layer.end-start)*(i/layer.count)});
      }
      start = layer.end;
    }
    return strokes;
  }
  function start(canvas, image, {onComplete = () => {}, reducedMotion = false} = {}) {
    const width = 720;
    const height = Math.round(width*image.naturalHeight/image.naturalWidth);
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d', {alpha:false});
    const source = document.createElement('canvas');
    source.width=width; source.height=height;
    const original = source.getContext('2d', {willReadFrequently:true});
    original.drawImage(image,0,0,width,height);
    const pixels = original.getImageData(0,0,width,height).data;
    ctx.fillStyle='#e8dfca'; ctx.fillRect(0,0,width,height);
    const strokes = schedule(width,height);
    const brush = randomGenerator(47);
    let frame = 0, index = 0, stopped = false;
    const began = performance.now();
    function finish() {
      ctx.globalAlpha = 1;
      ctx.drawImage(source,0,0);
      onComplete();
    }
    function stroke(mark) {
      const x=Math.min(width-1,Math.floor(mark.x)), y=Math.min(height-1,Math.floor(mark.y));
      const pixel=(y*width+x)*4;
      ctx.fillStyle=`rgb(${pixels[pixel]},${pixels[pixel+1]},${pixels[pixel+2]})`;
      ctx.save();ctx.translate(mark.x,mark.y);ctx.rotate(mark.angle);
      ctx.globalAlpha=.9;
      const length=mark.size*(1.2+brush()), thickness=mark.size*(.4+brush()*.45);
      ctx.beginPath();
      ctx.moveTo(-length/2,-thickness*.25);
      ctx.lineTo(-length*.25,-thickness*.52);
      ctx.lineTo(length*.4,-thickness*.4);
      ctx.lineTo(length*.5,thickness*.05);
      ctx.lineTo(length*.32,thickness*.5);
      ctx.lineTo(-length*.4,thickness*.4);
      ctx.closePath();ctx.fill();
      // Pequeños huecos y estrías aportan una textura irregular al pastel.
      ctx.globalAlpha=.25;
      ctx.fillRect(-length*.38,-thickness*.65,length*.7,Math.max(.7,thickness*.06));
      ctx.restore();
    }
    function tick(now) {
      if (stopped) return;
      const elapsed=now-began;
      if (elapsed>=DURATION || reducedMotion) { finish();return; }
      const progress=Math.min(1,elapsed/7000);
      while(index<strokes.length && strokes[index].when<=progress) stroke(strokes[index++]);
      // Última veladura de detalle: conserva las pinceladas de la pintura original.
      if(elapsed>7000) {
        ctx.globalAlpha=Math.min(1,(elapsed-7000)/600);
        ctx.drawImage(source,0,0);
        ctx.globalAlpha=1;
      }
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    return () => { stopped=true;cancelAnimationFrame(frame); };
  }
  return {start,schedule,DURATION};
})();
