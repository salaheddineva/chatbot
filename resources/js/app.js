import './bootstrap';

import { WavRecorder, WavStreamPlayer } from './lib/wavtools/index.js';
import { instructions } from './utils/conversation_config.js';
import { RealtimeClient } from './realtime-api-beta/lib/client.js';

const LOCAL_RELAY_SERVER_URL = import.meta.env.VITE_LOCAL_RELAY_SERVER_URL;
const ASSET_URL_BASE = import.meta.env.VITE_ASSET_URL_BASE;
const APP_ID = "chatbot-app-c41436bcc524"

const BOT_ACTIONS = {
  NORMAL: 'normal',
  SPEAKING: 'speaking',
  HEARING: 'hearing',
};
const MIC_ACTIONS = {
  PLAY: 'mic',
  STOP: 'stop',
};

const wavRecorder = new WavRecorder({ sampleRate: 24000 });
const wavStreamPlayer = new WavStreamPlayer({ sampleRate: 24000 });
const client = new RealtimeClient({ url: LOCAL_RELAY_SERVER_URL });

const [items, setItems] = [[], (item) => items.push(item)];
const [realtimeEvents, setRealtimeEvents] = [[], (event) => realtimeEvents.push(event)];
let [isConnected, setIsConnected] = [false, (value) => isConnected = value];

client.updateSession({ 
  turn_detection: { type: 'server_vad' },
  instructions,
  input_audio_transcription: { model: 'whisper-1' },
});

client.on('realtime.event', (realtimeEvent) => {
  const lastEvent = realtimeEvents[realtimeEvents.length - 1];

  if (lastEvent?.event?.type === realtimeEvent.event.type) {
    lastEvent.count = (lastEvent.count || 0) + 1;
    setRealtimeEvents(realtimeEvents.slice(0, -1).concat(lastEvent));
  } else {
    setRealtimeEvents(realtimeEvents.concat(realtimeEvent))
  }
});

client.on('error', (event) => console.error(event));

client.on('conversation.interrupted', async () => {
  const trackSampleOffset = wavStreamPlayer.interrupt();
  if (trackSampleOffset?.trackId) {
    const { trackId, offset } = trackSampleOffset;
    client.cancelResponse(trackId, offset);
  }

  const app = window.document.getElementById(APP_ID);
  const faceImg = app.querySelector('img');
  faceImg.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.HEARING}.png`;
  const waveImg = app.querySelector('img[src*="wave.gif"]');
  waveImg.style.visibility = 'hidden';
});

client.on('conversation.updated', async ({ item, delta }) => {
  const items = client.conversation.getItems();
  if (delta?.audio) {
    wavStreamPlayer.add16BitPCM(delta.audio, item.id);
  }
  if (item.status === 'completed' && item.formatted.audio?.length) {
    const wavFile = await WavRecorder.decode(
      item.formatted.audio,
      24000,
      24000
    );
    item.formatted.file = wavFile;
  }
  setItems(items);

  const app = window.document.getElementById(APP_ID);
  const faceImg = app.querySelector('img');
  faceImg.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.SPEAKING}.png`;
  const waveImg = app.querySelector('img[src*="wave.gif"]');
  waveImg.style.visibility = 'visible';
});

setItems(client.conversation.getItems());

setTimeout(() => {
  const app = window.document.createElement('div');
  app.id = APP_ID;
  app.append(...createPopupElements());
  window.document.body.appendChild(app);
}, 1);

function createPopupElements() {
  const elements = [];

  const face = window.document.createElement('div');
  face.style.position = 'absolute';
  face.style.bottom = '20px';
  face.style.right = '50px';

  const faceImg = window.document.createElement('img');
  faceImg.src = `${ASSET_URL_BASE}/${BOT_ACTIONS.NORMAL}.png`;
  faceImg.style.width = '160px';
  faceImg.style.height = '160px';
  face.appendChild(faceImg);

  const player = window.document.createElement('div');
  player.style.width = '160px';
  player.style.height = '24px';
  player.style.position = 'absolute';
  player.style.bottom = '20px';
  player.style.right = '50px';
  player.style.zIndex = '1000';
  player.style.borderRadius = '10px';
  player.style.backgroundColor = 'white';
  player.style.display = 'flex';
  player.style.justifyContent = 'space-between';
  player.style.alignItems = 'center';
  player.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.25)';

  const emptyDiv = window.document.createElement('div');
  emptyDiv.style.width = '20px';
  player.appendChild(emptyDiv);

  const waveImg = window.document.createElement('img');
  waveImg.src = `${ASSET_URL_BASE}/wave.gif`;
  waveImg.style.width = '75px';
  waveImg.style.height = '35px';
  waveImg.style.visibility = 'hidden';
  player.appendChild(waveImg);

  const micImg = window.document.createElement('img');
  micImg.src = `${ASSET_URL_BASE}/${MIC_ACTIONS.PLAY}.svg`;
  micImg.style.width = '20px';
  micImg.style.height = '20px';
  micImg.style.marginRight = '10px';
  micImg.style.cursor = 'pointer';
  micImg.addEventListener('click', async () => {
    micImg.src = !isConnected
      ? `${ASSET_URL_BASE}/${MIC_ACTIONS.STOP}.svg` 
      : `${ASSET_URL_BASE}/${MIC_ACTIONS.PLAY}.svg`;
    waveImg.style.visibility = isConnected ? 'hidden' : 'visible';
    faceImg.src = isConnected
      ? `${ASSET_URL_BASE}/${BOT_ACTIONS.NORMAL}.png`
      : `${ASSET_URL_BASE}/${BOT_ACTIONS.SPEAKING}.png`;

    isConnected 
      ? await disconnectConversation() 
      : await connectConversation();
  });
  player.appendChild(micImg);
  
  elements.push(face, player);

  return elements;
}

async function connectConversation() {
  setIsConnected(true);
  setRealtimeEvents([]);
  setItems(client.conversation.getItems());

  await wavRecorder.begin();

  await wavStreamPlayer.connect();

  await client.connect();
  client.sendUserMessageContent([
    {
      type: `input_text`,
      text: `Hello!`,
    },
  ]);

  if (client.getTurnDetectionType() === 'server_vad') {
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }
};

async function disconnectConversation () {
  setIsConnected(false);
  setRealtimeEvents([]);
  setItems([]);

  client.disconnect();

  await wavRecorder.end();

  wavStreamPlayer.interrupt();
}