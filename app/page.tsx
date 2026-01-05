'use client';

import { useState } from 'react';

export default function Home() {
  const [dailyRequests, setDailyRequests] = useState('25995');
  const [peakHourRequests, setPeakHourRequests] = useState('1989');
  const [avgResponseTime, setAvgResponseTime] = useState('200');
  const [stressMultiplier, setStressMultiplier] = useState('1.5');

  // Cálculos
  const requestsPerSecond = parseFloat(peakHourRequests) / 3600;
  const requestsPerMinute = parseFloat(peakHourRequests) / 60;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          K6 Load Test Calculator
        </h1>
        <p className="text-purple-200 text-center mb-8">
          Calcula la configuración óptima para tus pruebas de carga
        </p>

        {/* Inputs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Parámetros de Entrada
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-purple-200 mb-2 text-sm">
                Requests por Día
              </label>
              <input
                type="number"
                value={dailyRequests}
                onChange={(e) => setDailyRequests(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-2 text-sm">
                Peak Hour Requests
              </label>
              <input
                type="number"
                value={peakHourRequests}
                onChange={(e) => setPeakHourRequests(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-2 text-sm">
                Tiempo Promedio de Respuesta (ms)
              </label>
              <input
                type="number"
                value={avgResponseTime}
                onChange={(e) => setAvgResponseTime(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-2 text-sm">
                Multiplicador de Estrés (ej: 1.5 = 150% de carga)
              </label>
              <input
                type="number"
                step="0.1"
                value={stressMultiplier}
                onChange={(e) => setStressMultiplier(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Métricas Calculadas */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
            <div className="text-blue-200 text-sm mb-1">Requests/Segundo</div>
            <div className="text-3xl font-bold text-white">
              {requestsPerSecond.toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
            <div className="text-green-200 text-sm mb-1">Requests/Minuto</div>
            <div className="text-3xl font-bold text-white">
              {requestsPerMinute.toFixed(0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
            <div className="text-purple-200 text-sm mb-1">VUs Base</div>
            <div className="text-3xl font-bold text-white">
              {baseVUs}
            </div>
          </div>
        </div>

        {/* Configuraciones de Prueba */}
        <div className="space-y-6">
          {/* Smoke Test */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">💨</span> Smoke Test
            </h3>
            <p className="text-purple-200 text-sm mb-4">
              Verificación básica de funcionalidad con carga mínima
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-white">
                  {Math.ceil(baseVUs * 0.1)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-white">
                  {smokeTestDuration}m
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">RPS Esperado</div>
                <div className="text-2xl font-bold text-white">
                  {(requestsPerSecond * 0.1).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Load Test */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">📊</span> Load Test (Carga Normal)
            </h3>
            <p className="text-purple-200 text-sm mb-4">
              Prueba con la carga esperada en producción
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-white">{baseVUs}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-white">
                  {loadTestDuration}m
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">RPS Esperado</div>
                <div className="text-2xl font-bold text-white">
                  {requestsPerSecond.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Stress Test */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-xl p-6 border border-orange-400/30">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">🔥</span> Stress Test ({(stressMult * 100).toFixed(0)}% de carga)
            </h3>
            <p className="text-orange-200 text-sm mb-4">
              Prueba excediendo la carga normal para encontrar límites
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-white">
                  {stressVUs}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-white">
                  {stressTestDuration}m
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">RPS Esperado</div>
                <div className="text-2xl font-bold text-white">
                  {stressRPS.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Spike Test */}
          <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/30">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Spike Test
            </h3>
            <p className="text-red-200 text-sm mb-4">
              Picos repentinos de tráfico (2x la carga normal)
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">VUs</div>
                <div className="text-2xl font-bold text-white">
                  {baseVUs * 2}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">Duración</div>
                <div className="text-2xl font-bold text-white">
                  {spikeTestDuration}m
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-xs mb-1">RPS Esperado</div>
                <div className="text-2xl font-bold text-white">
                  {(requestsPerSecond * 2).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* K6 Script Example */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            Ejemplo K6 Script - Load Test
          </h3>
          <pre className="bg-slate-900/80 rounded-lg p-4 overflow-x-auto text-sm">
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
        </div>

        {/* Recomendaciones */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-semibold text-white mb-3">
            📋 Recomendaciones
          </h3>
          <ul className="space-y-2 text-blue-100">
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
