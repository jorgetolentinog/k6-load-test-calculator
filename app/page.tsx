'use client';

import { useState } from 'react';

// Componente Tooltip para RPS
function RPSTooltip() {
  return (
    <div className="group relative inline-block">
      <svg
        className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help inline-block ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute z-10 w-96 px-5 py-4 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>

        <h4 className="font-bold text-gray-900 mb-3 text-sm">RPS - Requests Per Second</h4>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-gray-900 mb-1">¿Qué es?</p>
            <p className="text-gray-600">
              Es la cantidad de peticiones por segundo que K6 intenta generar durante la prueba.
              Representa la carga real que tu aplicación está recibiendo.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-1">¿Cómo verificarlo?</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-2">
              <li>Ejecuta tu script de K6</li>
              <li>Observa la salida en consola durante la ejecución</li>
              <li>Busca la métrica <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">http_reqs</code></li>
              <li>Verás algo como: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">http_reqs....: 1000  33.2/s</code></li>
              <li>El último número (33.2/s) es el RPS real que K6 está generando</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-1">¿Por qué es importante?</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>
                <strong>RPS Real = RPS Esperado:</strong> Tu configuración de VUs es correcta
              </li>
              <li>
                <strong>RPS Real {'<'} RPS Esperado:</strong> Tu sistema está saturado y responde lento,
                K6 no puede generar más carga
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [peakHourRequests, setPeakHourRequests] = useState('1989');
  const [avgResponseTime, setAvgResponseTime] = useState('200');
  const [stressMultiplier, setStressMultiplier] = useState('1.5');

  // Cálculos
  const requestsPerSecond = parseFloat(peakHourRequests) / 3600;
  const avgRespTimeSec = parseFloat(avgResponseTime) / 1000;

  // VUs = (requests/sec) * (avg response time in seconds)
  const baseVUs = Math.ceil(requestsPerSecond * avgRespTimeSec);

  // Para pruebas de estrés
  const stressMult = parseFloat(stressMultiplier);
  const stressRPS = requestsPerSecond * stressMult;
  const stressVUs = Math.ceil(stressRPS * avgRespTimeSec);

  // Duración recomendada de pruebas
  const smokeTestDuration = 5; // minutos
  const loadTestDuration = 30; // minutos
  const stressTestDuration = 15; // minutos
  const spikeTestDuration = 10; // minutos

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          K6 Load Test Calculator
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Calcula la configuración óptima para tus pruebas de carga
        </p>

        {/* Layout de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna izquierda: Inputs (2 de 5 columnas) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inputs */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Parámetros de Entrada
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">
                    Peak Hour Requests
                  </label>
                  <input
                    type="number"
                    value={peakHourRequests}
                    onChange={(e) => setPeakHourRequests(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Peticiones totales en la hora pico
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">
                    Tiempo Promedio de Respuesta (ms)
                  </label>
                  <input
                    type="number"
                    value={avgResponseTime}
                    onChange={(e) => setAvgResponseTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo de respuesta actual del servicio
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">
                    Multiplicador de Estrés
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stressMultiplier}
                    onChange={(e) => setStressMultiplier(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ej: 1.5 = 150% de carga
                  </p>
                </div>
              </div>

              {/* Usuarios virtuales calculados */}
              <div className="bg-blue-50 rounded-xl p-4 mt-6 border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  📐 Fórmula de Cálculo
                </h3>
                <div className="bg-gray-800 rounded-lg p-3 mb-3">
                  <code className="text-green-400 text-xs">
                    VUs = RPS × Tiempo Respuesta
                  </code>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <span className="text-gray-600">RPS:</span>{' '}
                    <span className="text-gray-900 font-semibold">
                      {requestsPerSecond.toFixed(2)} req/s
                    </span>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <span className="text-gray-600">Tiempo respuesta:</span>{' '}
                    <span className="text-gray-900 font-semibold">
                      {avgRespTimeSec.toFixed(3)}s
                    </span>
                  </div>
                  <div className="bg-blue-100 rounded p-2 border border-blue-300">
                    <span className="text-gray-600">VUs base:</span>{' '}
                    <span className="text-blue-900 font-bold text-sm">
                      {baseVUs}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resultados (3 de 5 columnas) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Smoke Test */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💨</span> Smoke Test
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Verificación básica de funcionalidad con carga mínima
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.ceil(baseVUs * 0.1)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {smokeTestDuration}m
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1 flex items-center">
                    RPS Esperado
                    <RPSTooltip />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(requestsPerSecond * 0.1).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-gray-700 text-xs">
                  <span className="font-semibold">Cálculo:</span> {baseVUs} VUs base × 10% = {Math.ceil(baseVUs * 0.1)} VUs
                  <br />
                  <span className="font-semibold">Objetivo:</span> Verificar que el sistema funciona correctamente con carga muy baja antes de pruebas más intensivas.
                </p>
              </div>
            </div>

            {/* Load Test */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span> Load Test (Carga Normal)
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Prueba con la carga esperada en producción
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">{baseVUs}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loadTestDuration}m
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1 flex items-center">
                    RPS Esperado
                    <RPSTooltip />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {requestsPerSecond.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-gray-700 text-xs">
                  <span className="font-semibold">Cálculo:</span> {requestsPerSecond.toFixed(2)} req/s × {avgRespTimeSec.toFixed(3)}s = {baseVUs} VUs
                  <br />
                  <span className="font-semibold">Objetivo:</span> Simular la carga exacta del peak hour ({peakHourRequests} req/hora) para verificar que el servicio migrado soporta la misma carga de producción.
                </p>
              </div>
            </div>

            {/* Stress Test */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Stress Test ({(stressMult * 100).toFixed(0)}% de carga)
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Prueba excediendo la carga normal para encontrar límites
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressVUs}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressTestDuration}m
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1 flex items-center">
                    RPS Esperado
                    <RPSTooltip />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressRPS.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-gray-700 text-xs">
                  <span className="font-semibold">Cálculo:</span> {requestsPerSecond.toFixed(2)} req/s × {stressMult} (multiplicador) = {stressRPS.toFixed(2)} req/s → {stressRPS.toFixed(2)} × {avgRespTimeSec.toFixed(3)}s = {stressVUs} VUs
                  <br />
                  <span className="font-semibold">Objetivo:</span> Aplicar {(stressMult * 100).toFixed(0)}% de la carga normal para estresar el sistema más allá de lo esperado y encontrar su punto de quiebre o degradación.
                </p>
              </div>
            </div>

            {/* Spike Test */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Spike Test
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Picos repentinos de tráfico (2x la carga normal)
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {baseVUs * 2}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {spikeTestDuration}m
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1 flex items-center">
                    RPS Esperado
                    <RPSTooltip />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(requestsPerSecond * 2).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-gray-700 text-xs">
                  <span className="font-semibold">Cálculo:</span> {baseVUs} VUs base × 2 = {baseVUs * 2} VUs (equivalente a {(requestsPerSecond * 2).toFixed(2)} req/s)
                  <br />
                  <span className="font-semibold">Objetivo:</span> Simular un pico súbito de tráfico (200% de la carga normal) para verificar que el sistema puede manejar incrementos abruptos y recuperarse sin caídas.
                </p>
              </div>
            </div>

            {/* K6 Script Example */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ejemplo K6 Script - Load Test
              </h3>
              <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-green-400">{`import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: ${Math.ceil(baseVUs * 0.5)} }, // Ramp-up
    { duration: '${loadTestDuration}m', target: ${baseVUs} }, // Stay at peak
    { duration: '2m', target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<${parseFloat(avgResponseTime) * 1.5}'], // 95% bajo ${parseFloat(avgResponseTime) * 1.5}ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const res = http.get('https://tu-endpoint.com/api');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < ${parseFloat(avgResponseTime) * 1.5},
  });

  sleep(1);
}`}</code>
              </pre>

              {/* Explicación de Thresholds */}
              <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-gray-900 font-semibold text-sm mb-2">
                  ⚠️ Sobre los Thresholds (Umbrales)
                </h4>
                <div className="text-gray-700 text-xs space-y-2">
                  <p>
                    Los thresholds son <span className="font-semibold">valores sugeridos</span> basados en buenas prácticas. Debes ajustarlos según tus requisitos específicos:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <code className="bg-gray-200 px-1 rounded">p(95)&lt;{(parseFloat(avgResponseTime) * 1.5).toFixed(0)}ms</code>:
                      Sugerencia de que el 95% de las peticiones respondan en menos de 1.5× tu tiempo promedio actual ({avgResponseTime}ms).
                      Ajusta según tus SLAs.
                    </li>
                    <li>
                      <code className="bg-gray-200 px-1 rounded">rate&lt;0.01</code>:
                      Sugerencia de que menos del 1% de las peticiones fallen.
                      Para sistemas críticos podrías usar 0.001 (0.1%) o menos.
                    </li>
                  </ul>
                  <p className="text-gray-900 font-semibold mt-2">
                    💡 Mide primero el rendimiento actual de producción y establece thresholds basados en esos datos reales, no en estimaciones.
                  </p>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                📋 Recomendaciones
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Ejecuta primero el Smoke Test para verificar funcionalidad básica</li>
                <li>• Luego el Load Test para validar rendimiento bajo carga normal</li>
                <li>• Stress Test te ayudará a encontrar el punto de quiebre del sistema</li>
                <li>• Spike Test valida la capacidad de recuperación ante picos súbitos</li>
                <li>• Monitorea CPU, memoria y conexiones de BD durante las pruebas</li>
                <li>• Observa el RPS real de K6 (pasa el mouse sobre el ícono ⓘ para más info)</li>
                <li>• Considera hacer pruebas en horarios de baja actividad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
