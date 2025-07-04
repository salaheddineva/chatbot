<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="{{ asset('towntown.ico') }}" type="image/x-icon">

  <title>Agent TownTown</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

  <!-- Styles / Scripts -->
  @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
    @vite(['resources/css/app.css', 'resources/js/app.js'])
  @else
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  @endif

  <meta name="csrf-token" content="{{ csrf_token() }}">
  @laravelPWA
  
  <style>
    .fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .fade-out {
      animation: fadeOut 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
  </style>
</head>

<body class="antialiased text-gray-900 bg-white font-inter with-agent">
  <div class="flex items-center justify-center min-h-screen p-6">
    <div class="w-full max-w-md">
      <img class="mx-auto mb-12 w-80" src="{{ url('/resources/images/towntown-logo_HD.png') }}" alt="TownTown Logo">

      <div class="p-8 bg-white border border-gray-200 shadow-xl rounded-3xl">
        <div class="mb-8 text-center">
          <h1 class="mb-2 text-3xl font-bold tracking-tight text-gray-900">
            Agent TownTown
          </h1>
          <p class="text-base leading-relaxed text-gray-600">
            Sélectionnez un agent pour commencer votre conversation
          </p>
        </div>

        <form class="space-y-6">
          <div class="space-y-2 transition-opacity duration-300" id="agent-select-container">
            <label for="agent-select" class="block text-sm font-medium text-gray-700">
              Choisir un Agent
            </label>
            <div class="relative">
              <select id="agent-select"
                class="w-full px-4 py-3 text-gray-900 transition-all duration-200 bg-white border border-gray-300 appearance-none cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent hover:border-gray-400">
                <option value="">Sélectionnez un agent...</option>
                <option value="prospecting-agent">Agent de prospection</option>
                <option value="reception-agent">Agent de réception</option>
                <option value="assistant-agent">Agent assistant</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div id="agent-description" class="hidden p-4 mt-4 border border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-2 h-2 mt-2 bg-gray-900 rounded-full"></div>
              <div class="flex-1">
                <p id="prospecting-description" class="hidden text-sm leading-relaxed text-gray-700">
                  Spécialiste en identification de nouvelles opportunités commerciales et en conversion des prospects en clients.
                </p>
                <p id="reception-description" class="hidden text-sm leading-relaxed text-gray-700">
                  Premier point de contact pour accueillir et orienter les clients vers les services adaptés à leurs besoins.
                </p>
                <p id="assistant-description" class="hidden text-sm leading-relaxed text-gray-700">
                  Support personnalisé pour répondre aux questions et accompagner les clients tout au long de leur parcours.
                </p>
              </div>
            </div>
          </div>

          <button type="button" id="start-chat"
            class="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] shadow-lg">
            Commencer la discussion
          </button>
        </form>

        <div id="agent-app" class="flex flex-col items-center mt-8"></div>
      </div>
    </div>
  </div>

  <div id="calendar-section" class="fixed z-50 bottom-6 right-6">
    <a href="{{ route('appointments.index') }}" id="calendar-link" target="_blank" rel="noopener noreferrer"
      class="inline-flex items-center px-4 py-3 text-sm font-medium text-white transition-all duration-200 transform bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 active:scale-95">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      Rendez-vous
    </a>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const calendarSection = document.getElementById('calendar-section');
      const calendarLink = document.getElementById('calendar-link');
      
      const agentSelect = document.getElementById('agent-select');
      const agentDescription = document.getElementById('agent-description');
      const descriptions = {
        'prospecting-agent': document.getElementById('prospecting-description'),
        'reception-agent': document.getElementById('reception-description'),
        'assistant-agent': document.getElementById('assistant-description')
      };

      agentSelect.addEventListener('change', function() {
        const selectedAgent = agentSelect.value;
        
        Object.values(descriptions).forEach(desc => desc.classList.add('hidden'));
        agentDescription.classList.add('hidden');
        
        if (selectedAgent && descriptions[selectedAgent]) {
          descriptions[selectedAgent].classList.remove('hidden');
          agentDescription.classList.remove('hidden');
        }
      });
    });
  </script>
</body>

</html>
