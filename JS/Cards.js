// משתנים גלובליים
let cards = [];
let selectedCards = [];
let score = 0;
let setsFound = 0;
let gameTimer = 0;
let timerInterval;
let hintsUsed = 0;
let fullDeck = [];

// מאפיינים של הקלפים
const SHAPES = ["ellipse", "diamond", "wave"];
const COLORS = ["red", "green", "purple"];
const FILLS = ["empty", "striped", "full"];
const COUNTS = [1, 2, 3];

function enterToTheGame()
{
    hideAllDivs();
    document.getElementById('title').style.display="none";
    document.getElementById('player-selection').style.display="flex";
    document.getElementById('existing-players').style.display = "block";
    renderPlayersList();
}

function startNewGame()
{
    document.body.style.overflow = "visible";
    renderPlayerInfo();
    const countInput = document.getElementById('card-count');
    const totalCards = countInput ? parseInt(countInput.value) : 81;
    countInput.value=81;
    selectedCards = [];
    score = 0;
    setsFound = 0;
    gameTimer = 0;
    hintsUsed = 0;
    document.getElementById('begining').style.display="none";
    document.getElementById('game-container').style.display = "block";
    window.onload = () => {
    document.querySelector("#game-container").style.display = "none";
    loadPlayerFromStorage();
    };

    // לוודא שיש סט חוקי
     do{
        fullDeck = createFullDeck().slice(0, totalCards);
        cards = fullDeck.splice(0, 12);
    }while (findAllSets().length === 0 && fullDeck.length >= 3)

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTimer++;
        updateTimer();
    }, 1000);

    renderCards();
    updateScore();
    updateTimer();

    document.getElementById('message').classList.remove('show');
}


// יצירת חפיסת קלפים
function createFullDeck() {
    const deck = [];
    for (let shape of SHAPES) {
        for (let color of COLORS) {
            for (let fill of FILLS) {
                for (let count of COUNTS) {
                    deck.push({ shape, color, fill, count });
                }
            }
        }
    }
    return shuffle(deck);
}

// ערבוב קלפים
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// עיצוב הצורה לפי הפרמטרים
function renderShape(card) {
    const className = `shape ${card.shape} ${card.fill} ${card.color}`;
    return `<div class="${className}"></div>`;
}

// יצירת HTML עבור קלף
function createCardHTML(card, index) {
    const shapes = Array.from({ length: card.count }, () => renderShape(card)).join('');
    return `
        <div class="card" onclick="selectCard(${index})" data-index="${index}">
            ${shapes}
        </div>
    `;
}

// בדיקה אם 3 קלפים יוצרים סט
function isValidSet(card1, card2, card3) {
    const properties = ['shape', 'color', 'fill', 'count']; 
    for (let prop of properties) {
        const values = [card1[prop], card2[prop], card3[prop]];
        // כל מאפיין צריך להיות או זהה בכל 3 הקלפים או שונה בכל 3
        if (!((values[1]==values[2]&&values[1]==values[0])|| (values[1]!=values[2]&&values[1]!=values[0]&&values[2]!=values[0])))

            return false;
    }
    return true;
}

// מציאת כל הסטים האפשריים
function findAllSets() {
    const sets = [];
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            for (let k = j + 1; k < cards.length; k++) {
                if (isValidSet(cards[i], cards[j], cards[k])) {
                    sets.push([i, j, k]);
                }
            }
        }
    }
    return sets;
}
  
// בחירת קלף
function selectCard(index) {
    const cardElement = document.querySelector(`[data-index="${index}"]`);
    if (selectedCards.includes(index)) {
        // ביטול בחירה
        selectedCards = selectedCards.filter(i => i !== index);
        cardElement.classList.remove('selected');
        cardElement.style.borderColor = "";
        cardElement.style.backgroundColor = "";
    } else if (selectedCards.length < 3) {
        // בחירת קלף
        selectedCards.push(index);
        cardElement.classList.add('selected');
        cardElement.style.borderColor = currentPlayer.color;
        cardElement.style.backgroundColor = lightenColor(currentPlayer.color ,0.65); 
        // בדיקת סט כאשר נבחרו 3 קלפים
        if (selectedCards.length === 3) {
            checkSet();
        }
    }
}

// בדיקת סט
function checkSet() {
    const [i, j, k] = selectedCards;
    const isValid = isValidSet(cards[i], cards[j], cards[k]);
    
    if (isValid) {
        // סט נכון
        score += 10;
        setsFound++;
        showMessage('מצוין! מצאת סט!', 'success');
        
        // סימון הקלפים כנכונים
        selectedCards.forEach(index => {
            const cardElement = document.querySelector(`[data-index="${index}"]`);
            cardElement.style.borderColor = "";
            cardElement.style.backgroundColor = "";
            cardElement.classList.add('correct');
        });
        
        // החלפת הקלפים אחרי שניה
        setTimeout(() => {
            replaceCards();
        }, 1000);
        
    } else {
        // סט לא נכון
        score = score>1?score-2:0;
        showMessage('אופס! זה לא סט נכון', 'error');
        
        // סימון הקלפים כלא נכונים
        selectedCards.forEach(index => {
            const cardElement = document.querySelector(`[data-index="${index}"]`);
            cardElement.style.borderColor = "";
            cardElement.style.backgroundColor = "";
            cardElement.classList.add('incorrect');
        });
        
        // ביטול הבחירה אחרי זמן קצר
        setTimeout(() => {
            clearSelection();
        }, 1000);
    }
    
    updateScore();
}

//החלפת קלפים אחרי מציאת סט
function replaceCards() {
    selectedCards.forEach(index => {
        if (fullDeck.length > 0) {
            cards[index] = fullDeck.shift();  // שולפים קלף חדש מהחפיסה
        } else {
            // אם אין יותר קלפים – מסמנים את המקום כריק
            cards[index] = null;
        }
    });

    // מנקים בחירה וקלפים null
    clearSelection();
    cards = cards.filter(card => card !== null);
    renderCards();

    // אם החפיסה ריקה ונשארו קלפים – נבדוק אם יש סטים
    if (fullDeck.length === 0 && findAllSets().length === 0) {
        // showMessage("המשחק נגמר! כל הכבוד!", "success");
        endGame();
    }
}

// ניקוי בחירה
function clearSelection() {
    selectedCards = [];
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected', 'correct', 'incorrect');
        card.style.borderColor = "";
        card.style.backgroundColor = "";
    });
}

// הצגת הודעה
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 2000);
}

// עדכון הניקוד
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('sets-found').textContent = setsFound;
}

// עדכון הטיימר
function updateTimer() {
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// הצגת רמז
function showHint() {
    const sets = findAllSets();
    if (sets.length > 0) {
        const randomSet = sets[Math.floor(Math.random() * sets.length)];
        const hintIndex = randomSet[Math.floor(Math.random() * 3)];
        
        const cardElement = document.querySelector(`[data-index="${hintIndex}"]`);
        cardElement.style.border = '3px solid #ffc107';
        cardElement.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.8)';
        
        setTimeout(() => {
            if (selectedCards.includes(hintIndex)) 
            {
                cardElement.style.borderColor = currentPlayer.color;
                cardElement.style.backgroundColor = lightenColor(currentPlayer.color ,0.65); // 40% בהיר יותר
            }
            else
            {
                cardElement.style.borderColor = "";
                cardElement.style.backgroundColor = "";
            }
            cardElement.style.boxShadow = '';

        }, 2000);
        
        hintsUsed++;
        score = Math.max(0, score - 1);
        updateScore();
        
        showMessage('רמז: הקלף הזה חלק מסט!', 'hint');
        }
    else if (fullDeck.length > 0) 
        {
            addMoreCards();
        }
        else 
        {
            endGame(); 
        }
}

function addMoreCards()
{
    // בוחרים קלף אקראי מהלוח להחזיר לערמה
    const randomIndex = Math.floor(Math.random() * cards.length);
    const returnedCard = cards[randomIndex];
    
    // מחזירים את הקלף ל-fullDeck (בסוף החפיסה)
    fullDeck.push(returnedCard);
    
    // שולפים קלף חדש מהחפיסה
    const newCard = fullDeck.shift();
    
    // מחליפים בלוח
    cards[randomIndex] = newCard;
    
    renderCards();
    showMessage('קלף הוחלף כי אין סטים.', 'success');
}

// רינדור הקלפים
function renderCards() {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = cards.map((card, index) => createCardHTML(card, index)).join('');
}

//פונ' לסיום המשחק
function endGame() {

    clearInterval(timerInterval);
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = null;
    });

    let player = currentPlayer;
    document.body.style.overflow = "hidden";
    
    // עדכון שיא אם הניקוד הנוכחי גבוה מהשיא הקודם
    if (score > player.highScore) {
        player.highScore = score;

        // עדכון ברשימת השחקנים
        let players = JSON.parse(localStorage.getItem("players")) || [];
        const index = players.findIndex(p => p.id === player.id);
        if (index !== -1) 
            players[index] = player;

        // שמירה לשני המקומות
        localStorage.setItem("players", JSON.stringify(players));
        localStorage.setItem("currentPlayer", JSON.stringify(player));
        document.getElementById('highScore').textContent = player.highScore;
        console.log("שיא חדש:", player.highScore);
    }

    // הצגת הודעה עם הניקוד 
    let scr = document.getElementById('scorefinal');
    scr.innerText = score;
    console.log("Score:", score);
    console.log("scr:", scr);
    overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
}

document.querySelector("#new-game-btn").addEventListener("click", () => {
    scr= document.getElementById('score').textContent;
    let player = currentPlayer;
    document.body.style.overflow = "hidden";
    // עדכון שיא אם הניקוד הנוכחי גבוה מהשיא הקודם
    if (scr > player.highScore) {
        player.highScore = scr;
        // עדכון ברשימת השחקנים
        let players = JSON.parse(localStorage.getItem("players")) || [];
        const index = players.findIndex(p => p.id === player.id);
        if (index !== -1) 
            players[index] = player;
        // שמירה לשני המקומות
        localStorage.setItem("players", JSON.stringify(players));
        localStorage.setItem("currentPlayer", JSON.stringify(player));
        document.getElementById('highScore').textContent = player.highScore;
        console.log("שיא חדש:", player.highScore);
    }
  const confirmSwitch1 = confirm("האם ברצונך לבחור שחקן אחר? לחץ 'בטל' כדי להמשיך באותו שחקן.");
  
  if (confirmSwitch1) 
    {
    gameContainerDiv.style.display = "none";
    document.getElementById('existing-players').style.display = "block";
    playerSelectionDiv.style.display = "flex";
    currentPlayer = null;
    renderPlayersList();
  } 
  else
{
    document.getElementById('begining').style.display="flex";
    document.getElementById('game-container').style.display="none";
    renderPlayersList();
}
});

document.getElementById("restartBtn").addEventListener("click", () => {
  const confirmSwitch2 = confirm("האם ברצונך לבחור שחקן אחר? לחץ 'בטל' כדי להמשיך באותו שחקן.");
  overlay = document.getElementById('overlay');
  overlay.style.display = "none";
  if (confirmSwitch2) 
    {
    gameContainerDiv.style.display = "none";
    document.getElementById('existing-players').style.display = "block";
    playerSelectionDiv.style.display = "flex";
    currentPlayer = null;
    renderPlayersList();
  } 
  else
{
    document.getElementById('begining').style.display="flex";
    document.getElementById('game-container').style.display="none";
    renderPlayersList();
}
});

function hideAllDivs()  {
    document.getElementById('player-selection').style.display="none";
    document.getElementById('newPlayerForm').style.display="none";
    document.getElementById('begining').style.display="none";
    document.getElementById('game-container').style.display="none";
    document.getElementById('overlay').style.display="none";
    document.getElementById('scoresDiv').style.display="none";
    document.getElementById('title').style.display="none";
    document.getElementById('playersManagement').style.display="none"; 
    document.body.style.overflow = "hidden";

}

function GetScores()
{
    hideAllDivs();
    document.getElementById('scoresDiv').style.display="flex";
    renderHighScores();
}



function renderHighScores() {
    const tableBody = document.querySelector("#highScoresTable tbody");
    tableBody.innerHTML = "";
  
    let players = JSON.parse(localStorage.getItem("players")) || [];
  
    // סינון שחקנים עם שיא 0
    players = players.filter(p => p.highScore > 0);
  
    // מיון בסדר יורד לפי שיא
    players.sort((a, b) => b.highScore - a.highScore);
  
    // יצירת שורות בטבלה
    players.forEach((player, index) => {
      const row = document.createElement("tr");

      const rankCell = document.createElement("td");
      rankCell.textContent = index + 1;
  
      const nameCell = document.createElement("td");
      nameCell.textContent = player.name;
  
      const scoreCell = document.createElement("td");
      scoreCell.textContent = player.highScore;
  
      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(scoreCell);
      tableBody.appendChild(row);
    });
  }

 function updatePreviewColor(){
    const color = document.getElementById("player-color").value;
    let cardExample=document.getElementById("cardExample");
    cardExample.style.borderColor = color;
    cardExample.style.backgroundColor = lightenColor(color ,0.65); 
 }


renderPlayersList();
if (currentPlayer) {
  startGameWithPlayer();
}

