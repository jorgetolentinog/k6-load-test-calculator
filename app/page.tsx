'use client';

import { useState } from 'react';

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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          K6 Load Test Calculator
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Calcula la configuración óptima para tus pruebas de carga
        </p>

        {/* Inputs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Parámetros de Entrada
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
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
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Multiplicador de Estrés (ej: 1.5 = 150% de carga)
              </label>
              <input
                type="number"
                step="0.1"
                value={stressMultiplier}
                onChange={(e) => setStressMultiplier(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Usuarios virtuales */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            📐 Usuarios virtuales
          </h2>
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <code className="text-green-400 text-sm">
              VUs = (Requests/Segundo) × (Tiempo de Respuesta en segundos)
            </code>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-gray-600 mb-1">Peak Hour Requests</div>
              <div className="text-gray-900 font-semibold">{peakHourRequests} req/hora</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-gray-600 mb-1">÷ 3600 segundos</div>
              <div className="text-gray-900 font-semibold">= {requestsPerSecond.toFixed(2)} req/seg</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-gray-600 mb-1">× {avgRespTimeSec.toFixed(3)}s respuesta</div>
              <div className="text-gray-900 font-semibold">= {baseVUs} VUs</div>
            </div>
          </div>
          <p className="text-gray-700 text-xs mt-3">
            Los VUs (Virtual Users) representan cuántos usuarios simulados necesitas para generar la carga deseada,
            considerando que cada usuario espera el tiempo de respuesta antes de hacer otra petición.
          </p>
        </div>

        {/* Configuraciones de Prueba */}
        <div className="space-y-6">
          {/* Smoke Test */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">💨</span> Smoke Test
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Verificación básica de funcionalidad con carga mínima
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.ceil(baseVUs * 0.1)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-gray-900">
                  {smokeTestDuration}m
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">RPS Esperado</div>
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
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-gray-900">{baseVUs}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadTestDuration}m
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">RPS Esperado</div>
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
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stressVUs}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stressTestDuration}m
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">RPS Esperado</div>
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
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {baseVUs * 2}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-gray-900">
                  {spikeTestDuration}m
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-gray-600 text-xs mb-1">RPS Esperado</div>
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
        </div>

        {/* K6 Script Example */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
                💡 Recomendación: Mide primero el rendimiento actual de producción y establece thresholds basados en esos datos reales, no en estimaciones.
              </p>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            📋 Recomendaciones
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Ejecuta primero el Smoke Test para verificar funcionalidad básica</li>
            <li>• Luego el Load Test para validar rendimiento bajo carga normal</li>
            <li>• Stress Test te ayudará a encontrar el punto de quiebre del sistema</li>
            <li>• Spike Test valida la capacidad de recuperación ante picos súbitos</li>
            <li>• Monitorea CPU, memoria y conexiones de BD durante las pruebas</li>
            <li>• Considera hacer pruebas en horarios de baja actividad en producción</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
