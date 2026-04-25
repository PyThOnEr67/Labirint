document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const stepDisp = document.getElementById('step-count');
    const coinDisp = document.getElementById('coin-count');
    const scoresList = document.getElementById('high-scores');
    const nameInput = document.getElementById('playerName');

    const size = 15; // Нечетное число для алгоритма
    const cellSize = canvas.width / size;
    
    let maze = [];
    let player = { x: 1, y: 1 };
    let exit = { x: size - 2, y: size - 2 };
    let coins = [];
    let collectedCoins = 0;
    let scores = JSON.parse(localStorage.getItem('mazeResults')) || [];

    // ГЕНЕРАЦИЯ СЛОЖНОГО ЛАБИРИНТА (Recursive Backtracker)
    function generateMaze() {
        maze = Array.from({ length: size }, () => Array(size).fill(0));
        
        function carve(x, y) {
            maze[y][x] = 1;
            const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
            
            for (let [dx, dy] of dirs) {
                let nx = x + dx, ny = y + dy;
                if (ny > 0 && ny < size - 1 && nx > 0 && nx < size - 1 && maze[ny][nx] === 0) {
                    maze[y + dy/2][x + dx/2] = 1; // Убираем стену между клетками
                    carve(nx, ny);
                }
            }
        }
        carve(1, 1);
        maze[exit.y][exit.x] = 1;

        // Расставляем монеты
        coins = [];
        while(coins.length < 5) {
            let cx = Math.floor(Math.random() * size);
            let cy = Math.floor(Math.random() * size);
            if (maze[cy][cx] === 1 && !(cx === 1 && cy === 1)) {
                if (!coins.find(c => c.x === cx && c.y === cy)) coins.push({x: cx, y: cy});
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Стены
        ctx.fillStyle = "#16213e";
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (maze[y][x] === 0) ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }

        // Монеты
        ctx.fillStyle = "#ffd700";
        coins.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x*cellSize + cellSize/2, c.y*cellSize + cellSize/2, cellSize/5, 0, Math.PI*2);
            ctx.fill();
        });

        // Выход
        ctx.fillStyle = "#28a745";
        ctx.fillRect(exit.x*cellSize + 5, exit.y*cellSize + 5, cellSize - 10, cellSize - 10);

        // Игрок
        ctx.fillStyle = "#007bff";
        ctx.fillRect(player.x*cellSize + 5, player.y*cellSize + 5, cellSize - 10, cellSize - 10);
    }

    function move(dx, dy) {
        let nx = player.x + dx;
        let ny = player.y + dy;

        if (maze[ny] && maze[ny][nx] === 1) {
            player.x = nx;
            player.y = ny;
            stepDisp.innerText = parseInt(stepDisp.innerText) + 1;

            // Сбор монет
            const cIdx = coins.findIndex(c => c.x === nx && c.y === ny);
            if (cIdx !== -1) {
                coins.splice(cIdx, 1);
                collectedCoins++;
                coinDisp.innerText = collectedCoins;
            }

            draw();
            if (nx === exit.x && ny === exit.y) setTimeout(handleWin, 100);
        }
    }

    function handleWin() {
        const name = nameInput.value || "Аноним";
        const steps = parseInt(stepDisp.innerText);
        alert(`Победа, ${name}! Собрано монет: ${collectedCoins}, шагов: ${steps}`);
        
        scores.push({ name, steps });
        scores.sort((a, b) => a.steps - b.steps);
        scores = scores.slice(0, 5);
        localStorage.setItem('mazeResults', JSON.stringify(scores));
        
        showScores();
        window.resetGame();
    }

    function showScores() {
        scoresList.innerHTML = scores.map(s => `<li><span>${s.name}</span> <b>${s.steps}</b></li>`).join('');
    }

    // Управление (Клавиатура)
    window.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp") move(0, -1);
        if (e.key === "ArrowDown") move(0, 1);
        if (e.key === "ArrowLeft") move(-1, 0);
        if (e.key === "ArrowRight") move(1, 0);
        if (e.key.includes("Arrow")) e.preventDefault();
    });

    // Управление (Кнопки на экране)
    document.getElementById('btn-up').onclick = () => move(0, -1);
    document.getElementById('btn-down').onclick = () => move(0, 1);
    document.getElementById('btn-left').onclick = () => move(-1, 0);
    document.getElementById('btn-right').onclick = () => move(1, 0);

    window.resetGame = () => {
        player = { x: 1, y: 1 };
        collectedCoins = 0;
        coinDisp.innerText = "0";
        stepDisp.innerText = "0";
        generateMaze();
        draw();
    };

    showScores();
    window.resetGame();
});