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
</head>

<body class="antialiased text-gray-900 bg-white font-inter with-agent">
  <div class="flex items-center justify-center min-h-screen p-6">
    <div class="w-full max-w-md">
      <img class="h-48 mx-auto w-80" src="{{ url('/resources/images/towntown-logo_HD.png') }}" alt="TownTown Logo">
      
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
          <div class="space-y-2">
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

          <button type="button" id="start-chat"
            class="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] shadow-lg">
            Commencer la discussion
          </button>
        </form>
        
        <div id="agent-app" class="flex flex-col items-center mt-8"></div>
      </div>
    </div>
  </div>
</body>

</html>
