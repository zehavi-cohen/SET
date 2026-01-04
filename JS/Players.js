//ניהול שחקנים


let players = JSON.parse(localStorage.getItem("players") || "[]");
let currentPlayer = null;

const existingPlayersDiv = document.getElementById("existing-players");
const playerSelectionDiv = document.getElementById("player-selection");
const gameContainerDiv = document.getElementById("game-container");

let editingPlayerId = null; 



// טען שחקנים קיימים לתצוגה
function renderPlayersList() {

  players = JSON.parse(localStorage.getItem("players") || "[]"); 
  existingPlayersDiv.innerHTML = "";
  if (players.length === 0)
   {
    existingPlayersDiv.innerHTML = "<p>אין שחקנים קיימים.</p>";
    return;
  }
  players.forEach(player => {
    const playerBtn = document.createElement("button");
    playerBtn.textContent = `${player.name}`;
    playerBtn.style.backgroundColor = player.color;
    playerBtn.style.color = "black";
    playerBtn.style.margin = "10px";
    playerBtn.style.padding = "10px";
    playerBtn.style.borderRadius = "12px" ;
    playerBtn.onclick = () => selectPlayer(player.id);
    existingPlayersDiv.appendChild(playerBtn);
  });
}

// בחר שחקן לפי מזהה
function selectPlayer(playerId) {
  currentPlayer = players.find(p => p.id === playerId);
  startGameWithPlayer();
}

// יצירת שחקן חדש
document.getElementById("newPlayerForm").addEventListener("submit", e => {
  e.preventDefault();

  const nameInput = document.getElementById("player-name");
  const colorInput = document.getElementById("player-color");
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!name) return alert("יש להזין שם שחקן");

  let players = JSON.parse(localStorage.getItem("players") || "[]");
  if (editingPlayerId)
   {
    // עדכון שחקן קיים
    const player = players.find(p => p.id === editingPlayerId);
    if (player) {
      player.name = name;
      player.color = color;
      currentPlayer = player;
    }
    editingPlayerId = null;
    nameInput.value = "";
    colorInput.value = "#0000ff";
    localStorage.setItem("players", JSON.stringify(players));
    ManagePlayers();
  } else {
    // יצירת שחקן חדש
    const newPlayer = {
      id: Date.now().toString(),
      name,
      color,
      highScore: 0
    };
    players.push(newPlayer);
    currentPlayer = newPlayer;
    localStorage.setItem("players", JSON.stringify(players));
    nameInput.value = "";
    colorInput.value = "#0000ff";
    startGameWithPlayer();
  }
});

// התחלת משחק עם השחקן הנבחר
function startGameWithPlayer() {

  localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  const players = JSON.parse(localStorage.getItem("players") || "[]");
  const updatedPlayer = players.find(p => p.id === currentPlayer.id);
  if (updatedPlayer) 
  currentPlayer = updatedPlayer;

  // הצגת פרטים מעודכנים
  newPlayerForm.style.display = "none";
  playerSelectionDiv.style.display = "none";
  renderPlayerInfo();
  document.getElementById('startName').textContent = "הי " + currentPlayer.name + "!";
  console.log(currentPlayer.highScore);
  document.getElementById('highScore').textContent = currentPlayer.highScore;
  document.getElementById('begining').style.display = "flex";
}

// הצגת פרטי השחקן בראש המשחק
function renderPlayerInfo() {

  document.getElementById("sname").textContent=currentPlayer.name;
  document.getElementById("sscore").textContent=currentPlayer.highScore;
  document.getElementById("img").style.borderColor=currentPlayer.color;
}

document.getElementById("createNewPlayerBtn").addEventListener("click", () => {
  document.getElementById("newPlayerForm").style.display = "flex";
  existingPlayersDiv.style.display = "none";
  playerSelectionDiv.style.display = "none";
  updatePreviewColor();
});

function ManagePlayers()
{
  hideAllDivs();
  document.getElementById("playersManagement").style.display="flex";
  ManagePlayersList();
}

//ניהול שחקנים
function loadPlayerFromStorage() {
    const savedPlayer = localStorage.getItem("currentPlayer");
    if (savedPlayer) {
        currentPlayer = JSON.parse(savedPlayer);
        document.getElementById("new-player-section").style.display = "none";
        document.getElementById("current-player-info").textContent =
            `שלום, ${currentPlayer.name}! השיא שלך הוא ${currentPlayer.highScore || 0} נקודות`;
    }
}

function ManagePlayersList() 
{
  const players = JSON.parse(localStorage.getItem("players") || "[]");
  const tbody = document.querySelector("#playersTable tbody");
  tbody.innerHTML = "";
  console.log(localStorage.getItem("players"));

  players.forEach(player => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.name}</td>
      <td><div style="width: 20px; height: 20px; background:${player.color}; border-radius: 4px;  margin-left: auto;
      margin-right: auto;"></div></td>
      <td>${player.highScore}</td>
      
      <td>
        <button onclick="editPlayer(${player.id})">✏️</button>
        <button onclick="deletePlayer(${player.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function deletePlayer(id) {
  let players = JSON.parse(localStorage.getItem("players") || "[]");
  players = players.filter(p => p.id !== id.toString());
  localStorage.setItem("players", JSON.stringify(players));
  ManagePlayersList();
}

function editPlayer(id) {
  const players = JSON.parse(localStorage.getItem("players") || "[]");
  const player = players.find(p => p.id === id.toString());
  if (!player) return;

  document.getElementById("player-name").value = player.name;
  document.getElementById("player-color").value = player.color;
  editingPlayerId = id.toString(); 
  hideAllDivs();
  document.getElementById("newPlayerForm").style.display = "flex";
  updatePreviewColor();
}

