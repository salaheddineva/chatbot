<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Rendez-vous</title>
  
  @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
    @vite(['resources/css/app.css', 'resources/js/app.js'])
  @else
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  @endif
</head>
<body class="min-h-screen bg-gray-50">
  <header class="bg-white border-b border-gray-200">
    <div class="px-6 py-4 mx-auto max-w-7xl">
      <h1 class="text-xl font-semibold text-gray-900">Rendez-vous</h1>
    </div>
  </header>

  <main class="py-8">
    <div class="px-6 mx-auto max-w-7xl">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Rendez-vous</h2>
        <p class="mt-1 text-sm text-gray-600">Consulter les rendez-vous programmés</p>
      </div>

      @if ($appointments->isEmpty())
        <div class="p-12 text-center bg-white border border-gray-200 rounded-lg">
          <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun rendez-vous trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">Aucun rendez-vous n'a encore été programmé.</p>
        </div>
      @else
        <div class="overflow-hidden bg-white border border-gray-200 rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Titre
                </th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Description
                </th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date
                </th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Heure
                </th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @foreach ($appointments as $appointment)
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    {{ $appointment->title }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ Str::limit($appointment->description, 100) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ $appointment->start_time->format('d M Y') }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ $appointment->start_time->format('H:i') }} - {{ $appointment->end_time->format('H:i') }}
                  </td>
                  <td class="px-6 py-4">
                    @php
                      $statusTranslations = [
                        'scheduled' => 'Programmé',
                        'canceled' => 'Annulé',
                        'completed' => 'Terminé'
                      ];
                      $statusClasses = [
                        'scheduled' => 'bg-green-100 text-green-800',
                        'canceled' => 'bg-red-100 text-red-800',
                        'completed' => 'bg-blue-100 text-blue-800'
                      ];
                      $statusClass = $statusClasses[$appointment->status] ?? 'bg-gray-100 text-gray-800';
                      $statusText = $statusTranslations[$appointment->status] ?? ucfirst($appointment->status);
                    @endphp
                    <span class="inline-flex px-2 text-xs font-semibold leading-5 rounded-full {{ $statusClass }}">
                      {{ $statusText }}
                    </span>
                  </td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      @endif
    </div>
  </main>
</body>
</html>