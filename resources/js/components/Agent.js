import { RealtimeClient } from '../realtime-api-beta/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { getToolByName } from './tools/index.js';

import * as ProspectionAgent from './agents/prospecting-agent.agent.js';
import * as ReceptionAgent from './agents/reception-agent.agent.js';
import * as AssistantAgent from './agents/assistant-agent.agent.js';

const agents = [
  { name: 'prospecting-agent', agent: ProspectionAgent },
  { name: 'reception-agent', agent: ReceptionAgent },
  { name: 'assistant-agent', agent: AssistantAgent },
]

const APP_ID = "chatbot-app-d72849aef615"
const ASSET_URL_BASE = import.meta.env.VITE_ASSET_URL_BASE;
const BOT_ACTIONS = { NORMAL: 'normal', SPEAKING: 'speaking', HEARING: 'hearing' };
const LOCAL_RELAY_SERVER_URL = import.meta.env.VITE_LOCAL_RELAY_SERVER_URL;

let [isConnected, setIsConnected] = [false, (value) => isConnected = value];
const [realtimeEvents, setRealtimeEvents] = [[], (event) => realtimeEvents.push(event)];
const [items, setItems] = [[], (item) => items.push(item)];
let [userSaidGoodbye, setUserSaidGoodbye] = [false, (value) => userSaidGoodbye = value];
let [aiRespondedWithGoodbye, setAiRespondedWithGoodbye] = [false, (value) => aiRespondedWithGoodbye = value];

const client = new RealtimeClient({ url: LOCAL_RELAY_SERVER_URL });
const wavRecorder = new WavRecorder({ sampleRate: 24000 });
const wavStreamPlayer = new WavStreamPlayer({ sampleRate: 24000 });

client.on('realtime.event', (realtimeEvent) => {
  const lastEvent = realtimeEvents[realtimeEvents.length - 1];

  if (lastEvent?.event?.type === realtimeEvent.event.type) {
    lastEvent.count = (lastEvent.count || 0) + 1;
    setRealtimeEvents(realtimeEvents.slice(0, -1).concat(lastEvent));
  } else {
    setRealtimeEvents(realtimeEvents.concat(realtimeEvent))
  }
});
client.on('conversation.interrupted', async () => {
  const trackSampleOffset = wavStreamPlayer.interrupt();
  if (trackSampleOffset?.trackId) {
    const { trackId, offset } = trackSampleOffset;
    client.cancelResponse(trackId, offset);
  }

  setAiRespondedWithGoodbye(false);

  const chatbotFace = document.getElementById('chatbot-face');
  chatbotFace.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.HEARING}.png`;
  const chatbotWave = document.getElementById('chatbot-wave');
  chatbotWave.style.visibility = 'hidden';
});
client.on('conversation.updated', async ({ item, delta }) => {
  const items = client.conversation.getItems();
  if (delta?.audio) {
    wavStreamPlayer.add16BitPCM(delta.audio, item.id);
  }
  if (item.status === 'completed' && item.formatted.audio?.length) {
    const isGoodbye = await isGoodbyeMessage(item.formatted.transcript);

    if (item.role === 'user' && isGoodbye) setUserSaidGoodbye(true);
    if (item.role === 'assistant' && isGoodbye) setAiRespondedWithGoodbye(true);

    const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
    item.formatted.file = wavFile;
  }
  setItems(items);

  const chatbotFace = document.getElementById('chatbot-face');
  chatbotFace.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.SPEAKING}.png`;
  const chatbotWave = document.getElementById('chatbot-wave');
  chatbotWave.style.visibility = 'visible';

  if (userSaidGoodbye && aiRespondedWithGoodbye && !wavStreamPlayer.isPlaying()) {
    await closeChat();
    setUserSaidGoodbye(false);
    setAiRespondedWithGoodbye(false);
  } else if (userSaidGoodbye && aiRespondedWithGoodbye) {
    const checkPlaybackInterval = setInterval(async () => {
      if (!wavStreamPlayer.isPlaying()) {
        clearInterval(checkPlaybackInterval);

        if (userSaidGoodbye && aiRespondedWithGoodbye) await closeChat();
        setUserSaidGoodbye(false);
        setAiRespondedWithGoodbye(false);
      }
    }, 500);
  }
});
client.on('error', (event) => console.error(event));
setItems(client.conversation.getItems());

async function isGoodbyeMessage(text) {
  const obviousGoodbyes = ['bye', 'au revoir', 'goodbye'];
  const lowerText = text.toLowerCase();
  if (obviousGoodbyes.some(phrase => lowerText.includes(phrase))) return true;

  return new Promise((resolve) => {
    const analysisClient = new RealtimeClient({ url: LOCAL_RELAY_SERVER_URL });
    analysisClient.updateSession({
      instructions: "Votre seule tâche est de déterminer si un message est un au revoir/adieu.",
      modalities: ["text"],
      temperature: 0.1
    });
    analysisClient.on('realtime.event', ({ event }) => {
      if (event.type === "response.audio_transcript.done" && !!event.transcript) {
        const possibleResponses = ['oui', 'vrai', 'au revoir', 'adieu', 'bye', 'goodbye'];
        const isGoodbye = possibleResponses.some(phrase => event.transcript.includes(phrase));

        analysisClient.disconnect();
        resolve(isGoodbye);
      }
    });
    analysisClient.on('error', () => {
      analysisClient.disconnect();
      resolve(false);
    });
    analysisClient.connect().then(() => {
      analysisClient.sendUserMessageContent([
        {
          type: 'input_text',
          text: `Ce message est-il un au revoir ou un adieu ? Répondez seulement par Oui ou Non. Message: "${text}"`
        }
      ]);
    }).catch(() => {
      resolve(false);
    });
  });
}

setTimeout(() => {
  const canDocumentHaveFloatingAgent = window.document.querySelector('.with-agent');
  if (!canDocumentHaveFloatingAgent) return;

  const app = window.document.getElementById('agent-app');
  if (!app) return;

  app.setAttribute('id', APP_ID);
  app.append(...createElements());

  const startChatButton = window.document.getElementById('start-chat');
  if (startChatButton) startChatButton.addEventListener('click', toggleChat);
}, 1);

function createElements() {
  const elements = [];

  const faceImg = window.document.createElement('img');
  faceImg.id = 'chatbot-face';
  faceImg.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.NORMAL}.png`;
  faceImg.style.width = '160px';
  faceImg.style.height = '160px';

  const player = window.document.createElement('div');
  player.style.width = '160px';
  player.style.height = '24px';
  player.style.borderRadius = '10px';
  player.style.backgroundColor = 'white';
  player.style.display = 'flex';
  player.style.justifyContent = 'center';
  player.style.alignItems = 'center';
  player.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.25)';

  const waveImg = window.document.createElement('img');
  waveImg.id = 'chatbot-wave';
  waveImg.src = `${ASSET_URL_BASE}/wave.gif`;
  waveImg.style.width = '75px';
  waveImg.style.height = '35px';
  waveImg.style.visibility = 'hidden';
  player.appendChild(waveImg);

  elements.push(faceImg, player);
  return elements;
}

async function toggleChat() {
  const chatbotFace = window.document.getElementById('chatbot-face');
  const chatbotWave = window.document.getElementById('chatbot-wave');
  const startChatButton = window.document.getElementById('start-chat');
  const agentSelectContainer = window.document.getElementById('agent-select-container');
  if (!chatbotFace || !chatbotWave || !startChatButton || !agentSelectContainer) return;

  chatbotWave.style.visibility = isConnected ? 'hidden' : 'visible';
  chatbotFace.src = isConnected
    ? `${ASSET_URL_BASE}/${BOT_ACTIONS.NORMAL}.png`
    : `${ASSET_URL_BASE}/${BOT_ACTIONS.SPEAKING}.png`;
  startChatButton.innerText = isConnected
    ? 'Commencer la discussion'
    : 'Terminer la discussion';

  if (isConnected) {
    agentSelectContainer.classList.remove('fade-out');
    agentSelectContainer.classList.add('fade-in');
    agentSelectContainer.style.display = 'block';
  } else {
    agentSelectContainer.classList.remove('fade-in');
    agentSelectContainer.classList.add('fade-out');
    setTimeout(() => {
      agentSelectContainer.style.display = 'none';
    }, 300);
  }

  isConnected
    ? await disconnectConversation()
    : await connectConversation();
}

async function closeChat() {
  if (!isConnected) return;

  const chatbotFace = window.document.getElementById('chatbot-face');
  const chatbotWave = window.document.getElementById('chatbot-wave');
  const startChatButton = window.document.getElementById('start-chat');
  const agentSelectContainer = window.document.getElementById('agent-select-container');
  if (!chatbotFace || !chatbotWave || !startChatButton || !agentSelectContainer) return;

  chatbotWave.style.visibility = 'hidden';
  chatbotFace.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.NORMAL}.png`;
  startChatButton.innerText = 'Commencer la discussion';

  agentSelectContainer.classList.remove('fade-out');
  agentSelectContainer.classList.add('fade-in');
  agentSelectContainer.style.display = 'block';

  await disconnectConversation();
}

async function connectConversation() {
  setIsConnected(true);
  setRealtimeEvents([]);
  setItems(client.conversation.getItems());

  const agentSelectInput = window.document.getElementById('agent-select');
  if (!agentSelectInput || !agentSelectInput.value) {
    alert('Veuillez sélectionner un agent avant de commencer la discussion.');
    await toggleChat();
    return;
  }
  const selectedAgent = agents.find(agent => agent.name === agentSelectInput.value);
  if (!selectedAgent) {
    alert('Agent non trouvé. Veuillez sélectionner un agent valide.');
    await toggleChat();
    return;
  }
  const agentConfig = selectedAgent.agent?.instructions || {};

  if (selectedAgent.name === 'reception-agent') {
    [
      getToolByName('planify_meeting'),
      getToolByName('verify_disponibility_calendar')
    ].forEach(({ name, description, parameters, action }) => {
      if (!client.tools[name]) client.addTool({ name, description, parameters }, action);
    });
  }

  client.updateSession({
    turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 300 },
    instructions: agentConfig.instructions,
    input_audio_transcription: { model: 'gpt-4o-transcribe' },
  });

  await wavRecorder.begin();

  await wavStreamPlayer.connect();

  await client.connect();
  client.sendUserMessageContent([{ type: `input_text`, text: `Bonjour !` }]);

  if (client.getTurnDetectionType() === 'server_vad') {
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }
};

async function disconnectConversation() {
  setIsConnected(false);
  setRealtimeEvents([]);
  setItems([]);

  client.disconnect();

  await wavRecorder.end();

  wavStreamPlayer.interrupt();
}