  const wheel = document.getElementById('wheel');
  const spinBtn = document.getElementById('spin-btn');
  const optionInput = document.getElementById('option-input');
  const addOptionBtn = document.getElementById('add-option');
  const optionsList = document.getElementById('options');
  const clearOptionsBtn = document.getElementById('clear-options');
  const resultDisplay = document.createElement('div');
  document.body.appendChild(resultDisplay);
  resultDisplay.id = 'result-display';

  const spinSound = new Audio('audio\\spin.MP3');
 
  const ctx = wheel.getContext('2d');
  let options = [];
  let startAngle = 0;
  let spinTimeout = null;
  let spinning = false;
  let hoveredSection = -1;

  function drawWheel() {
      ctx.clearRect(0, 0, wheel.width, wheel.height);
    
      if (options.length === 0) {
          ctx.font = '20px Arial';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.fillText('Add options to spin!', wheel.width/2, wheel.height/2);
          return;
      }

      const sliceAngle = (2 * Math.PI) / options.length;
    
      for (let i = 0; i < options.length; i++) {
          ctx.beginPath();
          ctx.fillStyle = hoveredSection === i ? 
              `hsl(${(360 / options.length) * i}, 85%, 60%)` :
              `hsl(${(360 / options.length) * i}, 70%, 50%)`;
          ctx.moveTo(wheel.width/2, wheel.height/2);
          ctx.arc(wheel.width/2, wheel.height/2, wheel.width/2 - 10, 
              startAngle + i * sliceAngle,
              startAngle + (i + 1) * sliceAngle);
          ctx.closePath();
          ctx.fill();
        
          ctx.save();
          ctx.translate(wheel.width/2, wheel.height/2);
          ctx.rotate(startAngle + i * sliceAngle + sliceAngle/2);
          ctx.fillStyle = '#fff';
          ctx.font = hoveredSection === i ? 'bold 18px Arial' : '16px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(options[i], wheel.width/2 - 30, 0);
          ctx.restore();
      }

      // Draw the pointer arrow
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#333';
      ctx.moveTo(wheel.width - 20, wheel.height/2 - 20);
      ctx.lineTo(wheel.width - 20, wheel.height/2 + 20);
      ctx.lineTo(wheel.width, wheel.height/2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
  }

  function getSelectedSection(mouseX, mouseY) {
      const centerX = wheel.width / 2;
      const centerY = wheel.height / 2;
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      let angle = Math.atan2(dy, dx) - startAngle;
      if (angle < 0) angle += 2 * Math.PI;
      return Math.floor((angle / (2 * Math.PI)) * options.length);
  }

  function showWinningOption() {
      const normalizedAngle = startAngle % (2 * Math.PI);
      const section = Math.floor((-normalizedAngle / (2 * Math.PI)) * options.length);
      const winner = options[(section + options.length) % options.length];
    
      resultDisplay.innerHTML = `
          <div class="winner-announcement" style="
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              animation: fadeIn 0.5s;
          ">
              <h2>🎉 Winner! 🎉</h2>
              <p>${winner}</p>
          </div>
      `;
    
      setTimeout(() => {
          resultDisplay.innerHTML = '';
      }, 300);
  }

function spin() {
    if (spinning || options.length < 2) return;
    
    spinning = true;
    spinSound.play();
    const spinAngle = Math.random() * Math.PI * 2 + Math.PI * 50;
    const duration = 18000;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = (t) => {
            if (t < 0.8) {
                return t * 1.25;
            }
            return 1 - Math.pow(1 - t, 4);
        };
          
        startAngle = spinAngle * easeOut(progress);
        
        drawWheel();
        
        if (progress < 1) {
            spinTimeout = requestAnimationFrame(animate);
        } else {
            spinning = false;
            showWinningOption();
        }
    }
    
    if (spinTimeout) cancelAnimationFrame(spinTimeout);
    requestAnimationFrame(animate);
}
  wheel.addEventListener('mousemove', (e) => {
      if (spinning) return;
      const rect = wheel.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      hoveredSection = getSelectedSection(mouseX, mouseY);
      drawWheel();
  });

  wheel.addEventListener('mouseout', () => {
      hoveredSection = -1;
      drawWheel();
  });

  wheel.addEventListener('click', (e) => {
      if (spinning) return;
      const rect = wheel.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const clickedSection = getSelectedSection(mouseX, mouseY);
      alert(`Selected option: ${options[clickedSection]}`);
  });

  function updateOptionsList() {
      optionsList.innerHTML = '';
      options.forEach((option, index) => {
          const li = document.createElement('li');
          li.textContent = option;
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = '×';
          deleteBtn.onclick = () => {
              options.splice(index, 1);
              updateOptionsList();
              drawWheel();
          };
          li.appendChild(deleteBtn);
          optionsList.appendChild(li);
      });
  }

  spinBtn.addEventListener('click', spin);

  addOptionBtn.addEventListener('click', () => {
      const option = optionInput.value.trim();
      if (option && !options.includes(option)) {
          options.push(option);
          optionInput.value = '';
          updateOptionsList();
          drawWheel();
      }
  });

  optionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          addOptionBtn.click();
      }
  });

  clearOptionsBtn.addEventListener('click', () => {
      options = [];
      updateOptionsList();
      drawWheel();
  });

  drawWheel();