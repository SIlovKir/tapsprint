
let provider;
let signer;
let contract;
let contractAddress = "0xcbdebd958d614ec97ecb61c1bcbdeb4722036dc"; // заменяем на твой адрес
let abi = [
  "function startSprint() public",
  "function tap() public",
  "function endSprint() public",
  "function getMyScore() public view returns (uint256)"
];

let sprintStarted = false;
let tapCount = 0;
let timerInterval;

document.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    document.getElementById("startButton").onclick = startSprint;
    document.getElementById("tapButton").onclick = tap;
  } else {
    alert("Please install MetaMask to use this site.");
  }
});

async function startSprint() {
  try {
    await contract.startSprint();
    sprintStarted = true;
    tapCount = 0;
    document.getElementById("tapCount").textContent = "0";
    document.getElementById("gameArea").style.display = "block";
    let timeLeft = 30;
    document.getElementById("timer").textContent = timeLeft;
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        sprintStarted = false;
        contract.endSprint();
      }
    }, 1000);
  } catch (e) {
    console.error(e);
  }
}

async function tap() {
  if (!sprintStarted) return;
  try {
    await contract.tap();
    tapCount++;
    document.getElementById("tapCount").textContent = tapCount;
    const score = await contract.getMyScore();
    document.getElementById("bestScore").textContent = score.toString();
  } catch (e) {
    console.error(e);
  }
}
