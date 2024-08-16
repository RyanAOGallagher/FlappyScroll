import './App.css'

function App() {

  const handleClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {

          const canvas = document.createElement('canvas');
          canvas.id = "flappyScrollCanvas";
          document.body.appendChild(canvas);
          
          const ctx = canvas.getContext('2d');
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          canvas.style.position = "fixed";
          canvas.style.top = "0";
          canvas.style.left = "0";
          canvas.style.width = "100vw";
          canvas.style.height = "100vh";
          canvas.style.zIndex = "1000";
          canvas.style.pointerEvents = "none";

          // Prevent manual scrolling
          function preventScroll(event) {
              event.preventDefault();
              event.stopPropagation();
              return false;
            
          }

          window.addEventListener('wheel', preventScroll, { passive: false });
          window.addEventListener('touchmove', preventScroll, { passive: false });
          window.addEventListener('keydown', preventScroll, { passive: false });

          // Initialize bird
          let bird = { x: 50, y: 0, width: 30, height: 30, gravity: 0.3, lift: -15, velocity: 0 };
          let pipes = [];
          let gap = 500;
          let pipeWidth = 50;
          let scrollAmount = window.scrollY;
          const birdImg = new Image();
          birdImg.src = 'https://i.ibb.co/59j6Yz3/lewis.png';

          function drawBird() {
            ctx.clearRect(bird.x, bird.y, bird.width, bird.height);
            ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
          }

          function updateBird() {
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            if (bird.y + bird.height > canvas.height || bird.y < 0) {
              resetGame();
            }
          }

          function resetGame() {
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            pipes = [];
            window.scrollTo(0, 0);
          }

          function createPipe() {
            let pipeY = Math.random() * (canvas.height - gap) + gap / 2;
            pipes.push({ x: canvas.width, y: pipeY });
          }

          function drawPipes() {
            pipes.forEach(pipe => {
                // Upper pipe
                let upperPipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
                upperPipeGradient.addColorStop(0, "#0A0");
                upperPipeGradient.addColorStop(0.5, "#0F0");
                upperPipeGradient.addColorStop(1, "#0A0");
        
                ctx.fillStyle = upperPipeGradient;
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#070";
                ctx.shadowColor = "#050";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
        
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y - gap / 2);
                ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.y - gap / 2);
        
                // Lower pipe
                let lowerPipeGradient = ctx.createLinearGradient(pipe.x, pipe.y + gap / 2, pipe.x + pipeWidth, canvas.height);
                lowerPipeGradient.addColorStop(0, "#0A0");
                lowerPipeGradient.addColorStop(0.5, "#0F0");
                lowerPipeGradient.addColorStop(1, "#0A0");
        
                ctx.fillStyle = lowerPipeGradient;
                ctx.shadowColor = "#050";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
        
                ctx.fillRect(pipe.x, pipe.y + gap / 2, pipeWidth, canvas.height);
                ctx.strokeRect(pipe.x, pipe.y + gap / 2, pipeWidth, canvas.height);
        
                // Reset shadow for next draw
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
        
                // Move pipe
                pipe.x -= 2;
        
                // Remove off-screen pipes
                if (pipe.x + pipeWidth < 0) pipes.shift();
        
                // Scroll page when passing through a pipe
                if (pipe.x === bird.x) scrollPage();
        
                // Collision detection
                if (collisionDetection(pipe)) resetGame();
            });
        }
        

          function collisionDetection(pipe) {
            return (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth &&
              (bird.y < pipe.y - gap / 2 || bird.y + bird.height > pipe.y + gap / 2));
          }

          function scrollPage() {
            scrollAmount += 50;
            window.scrollTo(0, scrollAmount);
          }

          function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBird();
            drawPipes();
          }

          function update() {
            updateBird();
            draw();
          }

          function gameLoop() {
            update();
            window.flappyScrollAnimationFrame = requestAnimationFrame(gameLoop);
          }

          function flapBird() {
            bird.velocity = bird.lift;
          }

          window.addEventListener("click", flapBird);

          setInterval(createPipe, 1500);
          gameLoop();
        }
      });
    });
  }

  return (
    <>
      <h1>Flappy Scroll</h1>
      <button id="startGame" onClick={handleClick}>Start Game</button>
      <p>Scroll by playing a Flappy Bird game!</p>
    </>
  )
}

export default App
