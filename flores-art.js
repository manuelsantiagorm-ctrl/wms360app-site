// Dibujos SVG originales: tallos, hojas y pétalos se trazan por separado.
window.FlowerArt = (() => {
  const names = ['Rosas','Tulipanes','Girasoles','Peonías','Gerberas'];
  function draw(name) {
    if (!names.includes(name)) throw new Error('Flor desconocida');
    let sequence = 0;
    function path(d, stroke, fill = 'none', width = 2) {
      const delay = (sequence++ * .055).toFixed(2);
      return `<path class="trace${fill === 'none' ? '' : ' wash'}" pathLength="1" d="${d}" stroke="${stroke}" fill="${fill}" stroke-width="${width}" style="--delay:${delay}s"/>`;
    }
    let stems = '';
    for (const [x,y] of [[145,160],[245,115],[325,180]]) {
      stems += path(`M235 452 Q${x + 20} 320 ${x} ${y + 25}`,'#426c66','none',2.5);
      stems += path(`M${x+12} 315 Q${x-58} 309 ${x-65} 260 Q${x-8} 260 ${x+12} 315 Z`,'#426c66','#94b6a0');
      stems += path(`M${x+7} 355 Q${x+75} 342 ${x+65} 302 Q${x+17} 306 ${x+7} 355 Z`,'#426c66','#a8c5ad');
      stems += path(`M${x+10} 313 L${x-53} 272 M${x+10} 351 L${x+57} 314`,'#426c66');
    }
    let blooms = '';
    for (const [x,y,angle] of [[145,160,-18],[245,115,8],[325,180,22]]) {
      let bloom = '';
      if (name === 'Rosas') {
        bloom += path('M-47 0 Q-58-32-28-39 Q-12-64 12-42 Q45-46 47-14 Q64 9 34 32 Q9 57-20 34 Q-52 31-47 0Z','#9e536c','#e5a5b6');
        for (const d of ['M-30-28 Q-38 10 8 24 Q39 9 31-23','M-35 8 Q-9-31 28-21 Q34 14 8 24','M-23-17 Q4-39 20-8 Q18 15-4 11 Q-25 3-23-17','M-4 11 Q-10-8 10-12 Q23 3 7 6','M-47 0 Q-20 1-20 34 M12-42 Q5-24 28-21']) bloom += path(d,'#9e536c');
      } else if (name === 'Tulipanes') {
        bloom += path('M-38-37 Q-51 35 0 48 Q48 34 37-38 L15-20 0-50-16-20Z','#9b597d','#d8a0c5');
        bloom += path('M-38-37 Q-4-26 0 48 M37-38 Q5-25 0 48 M-16-20 Q0 1 15-20','#9b597d');
      } else if (name === 'Girasoles' || name === 'Gerberas') {
        const sunflower = name === 'Girasoles';
        const count = sunflower ? 15 : 23;
        for (let i=0;i<count;i++) {
          const petal = path(sunflower ? 'M-8-15 Q-23-45 0-66 Q23-44 8-15Z' : 'M-4-12 Q-13-46 0-65 Q13-44 4-12Z',sunflower ? '#b58a32' : '#b55d70',sunflower ? '#e8bd57' : '#eca0ab',1.5);
          bloom += `<g transform="rotate(${i*360/count})">${petal}</g>`;
        }
        bloom += path('M-22 0 A22 22 0 1 0 22 0 A22 22 0 1 0-22 0','#81663e',sunflower ? '#9b784c' : '#d4b56c');
        for (let i=0;i<12;i++) {
          const a=i*2.4, r=4+Math.sqrt(i)*4, cx=Math.cos(a)*r, cy=Math.sin(a)*r;
          bloom += path(`M${cx.toFixed(1)} ${cy.toFixed(1)} l1 1`,'#66573e','none',2);
        }
      } else {
        for (let ring=0;ring<3;ring++) {
          const scale=1-ring*.25;
          for (let i=0;i<7;i++) bloom += `<g transform="rotate(${i*360/7+ring*24}) scale(${scale})">${path('M-16 9 Q-62-8-44-34 Q-45-56-21-50 Q0-65 20-44 Q38-28 16 9Z','#a5698d',ring === 0 ? '#e6bfd5' : '#dca7c5',1.5)}</g>`;
        }
        bloom += path('M-12 0 Q-8-19 6-8 Q24 0 3 13 Q-12 19-12 0','#a5698d','#e6bfd5');
      }
      blooms += `<g transform="translate(${x} ${y}) rotate(${angle})">${bloom}</g>`;
    }
    const ribbon = path('M212 406 Q235 421 259 403 M232 415 Q192 386 193 414 Q200 432 232 415 Q276 385 274 412 Q264 435 232 415 M232 415 L217 451 M235 416 L254 448','#5483b3','none',2.5);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 500" role="img" aria-label="Ramo de ${name.toLowerCase()} dibujado trazo a trazo" stroke-linecap="round" stroke-linejoin="round">${stems}${blooms}${ribbon}</svg>`;
  }
  return {names,draw};
})();
