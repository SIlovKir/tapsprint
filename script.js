const desiredChainId = "0xc488";
const chainData = {
  chainId: desiredChainId,
  chainName: "Somnia Testnet",
  rpcUrls: ["https://rpc.testnet.somnia.network"],
  nativeCurrency: {
    name: "Somnia",
    symbol: "SOM",
    decimals: 18
  },
  blockExplorerUrls: ["https://explorer.testnet.somnia.network"]
};

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: desiredChainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [chainData],
      });
    } else {
      console.error("Ошибка сети:", switchError);
    }
  }
}
let provider;
let signer;
let contract;
let contractAddress = "0xcbe6bd9856d841ee97ecb6a1b1ccddeb472203d6";
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
    await switchNetwork(); // 
    
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
