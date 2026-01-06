'use client';

import { useState, useRef, useEffect } from 'react';

// Componente Tooltip para RPS
function RPSTooltip() {
  const [showAbove, setShowAbove] = useState(true);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseEnter = () => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const spaceAbove = triggerRect.top;
        const spaceBelow = window.innerHeight - triggerRect.bottom;

        // Si no hay suficiente espacio arriba (necesitamos al menos tooltipHeight + margen)
        // y hay más espacio abajo, mostramos abajo
        if (spaceAbove < tooltipHeight + 20 && spaceBelow > spaceAbove) {
          setShowAbove(false);
        } else {
          setShowAbove(true);
        }
      }
    };

    const trigger = triggerRef.current;
    if (trigger) {
      trigger.addEventListener('mouseenter', handleMouseEnter);
      return () => trigger.removeEventListener('mouseenter', handleMouseEnter);
    }
  }, []);

  return (
    <div ref={triggerRef} className="group relative inline-block">
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
      <div 
        ref={tooltipRef}
        className={`invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute z-10 w-96 px-5 py-4 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-xl left-1/2 -translate-x-1/2 pointer-events-none ${
          showAbove 
            ? 'bottom-full mb-2' 
            : 'top-full mt-2'
        }`}
      >
        <div className={`absolute left-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-white border-gray-200 ${
          showAbove 
            ? 'bottom-0 translate-y-1/2 border-r border-b' 
            : 'top-0 -translate-y-1/2 border-l border-t'
        }`}></div>

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
  const [requests, setRequests] = useState('1989');
  const [timeUnit, setTimeUnit] = useState<'second' | 'hour' | 'day'>('hour');
  const [avgResponseTime, setAvgResponseTime] = useState('200');
  const [stressMultiplier, setStressMultiplier] = useState('1.5');
  const [spikeMultiplier, setSpikeMultiplier] = useState('2');

  // Duraciones editables de pruebas (valores por defecto recomendados)
  const [smokeTestDuration, setSmokeTestDuration] = useState('5');
  const [loadTestDuration, setLoadTestDuration] = useState('30');
  const [stressTestDuration, setStressTestDuration] = useState('15');
  const [spikeTestDuration, setSpikeTestDuration] = useState('10');

  // Cálculos
  const requestsValue = parseFloat(requests);
  const requestsPerSecond =
    timeUnit === 'second' ? requestsValue :
    timeUnit === 'hour' ? requestsValue / 3600 :
    requestsValue / 86400; // día = 86400 segundos

  const avgRespTimeSec = parseFloat(avgResponseTime) / 1000;

  // VUs = (requests/sec) * (avg response time in seconds)
  const baseVUs = Math.ceil(requestsPerSecond * avgRespTimeSec);

  // Para pruebas de estrés
  const stressMult = parseFloat(stressMultiplier);
  const stressRPS = requestsPerSecond * stressMult;
  const stressVUs = Math.ceil(stressRPS * avgRespTimeSec);

  // Para pruebas de pico (spike)
  const spikeMult = parseFloat(spikeMultiplier);
  const spikeRPS = requestsPerSecond * spikeMult;
  const spikeVUs = Math.ceil(spikeRPS * avgRespTimeSec);

  // Convertir duraciones a números
  const smokeTestDurationNum = parseFloat(smokeTestDuration) || 5;
  const loadTestDurationNum = parseFloat(loadTestDuration) || 30;
  const stressTestDurationNum = parseFloat(stressTestDuration) || 15;
  const spikeTestDurationNum = parseFloat(spikeTestDuration) || 10;

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 p-8">
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
                    Requests
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={timeUnit}
                      onChange={(e) => setTimeUnit(e.target.value as 'second' | 'hour' | 'day')}
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="second">por segundo</option>
                      <option value="hour">por hora</option>
                      <option value="day">por día</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Número de peticiones en el período de tiempo seleccionado
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
              {/* Duración editable */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step="1"
                  value={smokeTestDuration}
                  onChange={(e) => setSmokeTestDuration(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 5 minutos
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.ceil(baseVUs * 0.1)}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    VUs base × 10%
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {smokeTestDurationNum}m
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    Configurado
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
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS base × 10%
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.ceil(requestsPerSecond * 0.1 * smokeTestDurationNum * 60)}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS × Duración × 60s
                  </div>
                </div>
              </div>

              {/* Configuración K6 Options */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-green-400 text-xs font-semibold mb-2">K6 Options:</div>
                <pre className="text-green-400 text-xs overflow-x-auto">
{`export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-arrival-rate', // Mantiene RPS constante
      rate: ${Math.ceil(requestsPerSecond * 0.1 * 3600)}, // Requests por hora
      timeUnit: '1h', // Unidad de tiempo para 'rate'
      duration: '${smokeTestDurationNum}m', // Duración total del test
      preAllocatedVUs: ${Math.ceil(baseVUs * 0.1)}, // VUs iniciales reservados
      maxVUs: ${Math.ceil(baseVUs * 0.1 * 2)}, // VUs máximos (escala si es necesario)
    },
  },
};

export default function () {
  http.get('https://tu-endpoint.com/api');
}`}
                </pre>
                <div className="border-t border-gray-600 mt-4 pt-3">
                  <div className="text-yellow-300 text-[12px]">
                    ✅ constant-arrival-rate garantiza {(requestsPerSecond * 0.1).toFixed(2)} RPS constantes
                    <br />
                    📊 preAllocatedVUs: {Math.ceil(baseVUs * 0.1)} | maxVUs: {Math.ceil(baseVUs * 0.1 * 2)} (escala automáticamente si es necesario)
                  </div>
                </div>
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

              {/* Duración editable */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step="1"
                  value={loadTestDuration}
                  onChange={(e) => setLoadTestDuration(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 30 minutos
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">{baseVUs}</div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS Base
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loadTestDurationNum}m
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    Configurado
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
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS base
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.ceil(requestsPerSecond * loadTestDurationNum * 60)}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS × Duración × 60s
                  </div>
                </div>
              </div>

              {/* Configuración K6 Options */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-green-400 text-xs font-semibold mb-2">K6 Options:</div>
                <pre className="text-green-400 text-xs overflow-x-auto">
{`export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-arrival-rate', // RPS con rampas graduales
      startRate: 0, // RPS inicial (empieza en 0)
      timeUnit: '1h', // Unidad de tiempo para 'rate'
      preAllocatedVUs: ${Math.ceil(baseVUs * 0.5)}, // VUs iniciales reservados
      maxVUs: ${Math.ceil(baseVUs * 2)}, // VUs máximos (escala automáticamente)
      stages: [
        { duration: '2m', target: ${Math.ceil(requestsPerSecond * 0.5 * 3600)} }, // Sube gradualmente
        { duration: '${loadTestDurationNum}m', target: ${Math.ceil(requestsPerSecond * 3600)} }, // Mantiene carga pico
        { duration: '2m', target: 0 }, // Baja gradualmente
      ],
    },
  },
};

export default function () {
  http.get('https://tu-endpoint.com/api');
}`}
                </pre>
                <div className="border-t border-gray-600 mt-4 pt-3">
                  <div className="text-yellow-300 text-[12px]">
                    ✅ ramping-arrival-rate garantiza el RPS objetivo: {requestsPerSecond.toFixed(2)} req/s
                    <br />
                    📊 VUs se ajustan automáticamente entre {Math.ceil(baseVUs * 0.5)} y {Math.ceil(baseVUs * 2)}
                    <br />
                    ⏱️ Duración total real: {loadTestDurationNum + 4}m (incluye 2m ramp-up + {loadTestDurationNum}m peak + 2m ramp-down)
                    <br />
                    📈 Total requests esperado: ~{Math.ceil((requestsPerSecond * 0.5 * 2 * 60) + (requestsPerSecond * loadTestDurationNum * 60) + (requestsPerSecond * 0.5 * 2 * 60))} (más que los {Math.ceil(requestsPerSecond * loadTestDurationNum * 60)} del peak)
                  </div>
                </div>
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

              {/* Multiplicador de Estrés */}
              <div className="mb-4">
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

              {/* Duración editable */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step="1"
                  value={stressTestDuration}
                  onChange={(e) => setStressTestDuration(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 15 minutos
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressVUs}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS × Tiempo Resp.
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stressTestDurationNum}m
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    Configurado
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
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS base × Multiplicador
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.ceil(stressRPS * stressTestDurationNum * 60)}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS × Duración × 60s
                  </div>
                </div>
              </div>

              {/* Configuración K6 Options */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-green-400 text-xs font-semibold mb-2">K6 Options:</div>
                <pre className="text-green-400 text-xs overflow-x-auto">
{`export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-arrival-rate', // RPS con rampas graduales
      startRate: 0, // RPS inicial (empieza en 0)
      timeUnit: '1h', // Unidad de tiempo para 'rate'
      preAllocatedVUs: ${Math.ceil(stressVUs * 0.5)}, // VUs iniciales reservados
      maxVUs: ${Math.ceil(stressVUs * 2)}, // VUs máximos (escala automáticamente)
      stages: [
        { duration: '2m', target: ${Math.ceil(stressRPS * 0.5 * 3600)} }, // Sube gradualmente
        { duration: '${stressTestDurationNum}m', target: ${Math.ceil(stressRPS * 3600)} }, // Mantiene sobrecarga
        { duration: '2m', target: 0 }, // Baja gradualmente
      ],
    },
  },
};

export default function () {
  http.get('https://tu-endpoint.com/api');
}`}
                </pre>
                <div className="border-t border-gray-600 mt-4 pt-3">
                  <div className="text-yellow-300 text-[12px]">
                    ✅ ramping-arrival-rate garantiza el RPS objetivo: {stressRPS.toFixed(2)} req/s
                    <br />
                    📊 VUs se ajustan automáticamente entre {Math.ceil(stressVUs * 0.5)} y {Math.ceil(stressVUs * 2)}
                    <br />
                    ⏱️ Duración total real: {stressTestDurationNum + 4}m (incluye 2m ramp-up + {stressTestDurationNum}m peak + 2m ramp-down)
                    <br />
                    📈 Total requests esperado: ~{Math.ceil((stressRPS * 0.5 * 2 * 60) + (stressRPS * stressTestDurationNum * 60) + (stressRPS * 0.5 * 2 * 60))} (más que los {Math.ceil(stressRPS * stressTestDurationNum * 60)} del peak)
                  </div>
                </div>
              </div>
            </div>

            {/* Spike Test */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Spike Test ({(spikeMult * 100).toFixed(0)}% de carga)
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Picos repentinos de tráfico
              </p>

              {/* Multiplicador de Spike */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Multiplicador de Pico
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={spikeMultiplier}
                  onChange={(e) => setSpikeMultiplier(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ej: 2 = 200% de carga (2x)
                </p>
              </div>

              {/* Duración editable */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step="1"
                  value={spikeTestDuration}
                  onChange={(e) => setSpikeTestDuration(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 10 minutos
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">VUs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {spikeVUs}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS × Tiempo Resp.
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Duración</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {spikeTestDurationNum}m
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    Configurado
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1 flex items-center">
                    RPS Esperado
                    <RPSTooltip />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {spikeRPS.toFixed(2)}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS base × Multiplicador
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-600 text-xs mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.ceil(spikeRPS * spikeTestDurationNum * 60)}
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1">
                    RPS × Duración × 60s
                  </div>
                </div>
              </div>

              {/* Configuración K6 Options */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-green-400 text-xs font-semibold mb-2">K6 Options:</div>
                <pre className="text-green-400 text-xs overflow-x-auto">
{`export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-arrival-rate', // RPS con rampas graduales
      startRate: 0, // RPS inicial (empieza en 0)
      timeUnit: '1h', // Unidad de tiempo para 'rate'
      preAllocatedVUs: ${Math.ceil(spikeVUs * 0.5)}, // VUs iniciales reservados
      maxVUs: ${Math.ceil(spikeVUs * 2)}, // VUs máximos (escala automáticamente)
      stages: [
        { duration: '30s', target: ${Math.ceil(requestsPerSecond * 3600)} }, // Calentamiento rápido
        { duration: '1m', target: ${Math.ceil(spikeRPS * 3600)} }, // Pico súbito (spike)
        { duration: '${spikeTestDurationNum}m', target: ${Math.ceil(spikeRPS * 3600)} }, // Mantiene el pico
        { duration: '2m', target: 0 }, // Baja gradualmente
      ],
    },
  },
};

export default function () {
  http.get('https://tu-endpoint.com/api');
}`}
                </pre>
                <div className="border-t border-gray-600 mt-4 pt-3">
                  <div className="text-yellow-300 text-[12px]">
                    ✅ ramping-arrival-rate garantiza el RPS objetivo: {spikeRPS.toFixed(2)} req/s en el pico
                    <br />
                    📊 VUs se ajustan automáticamente entre {Math.ceil(spikeVUs * 0.5)} y {Math.ceil(spikeVUs * 2)}
                    <br />
                    ⏱️ Duración total real: {spikeTestDurationNum + 3.5}m (incluye 0.5m warm-up + 1m spike-up + {spikeTestDurationNum}m peak + 2m ramp-down)
                    <br />
                    📈 Total requests esperado: ~{Math.ceil((requestsPerSecond * 0.5 * 60) + (requestsPerSecond * ((1 + spikeMult) / 2) * 1 * 60) + (spikeRPS * spikeTestDurationNum * 60) + (spikeRPS * 0.5 * 2 * 60))} (más que los {Math.ceil(spikeRPS * spikeTestDurationNum * 60)} del peak)
                  </div>
                </div>
              </div>
            </div>

            {/* Guía de Pruebas K6 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📚 Guía de Pruebas K6
              </h3>

              {/* Sección: Recomendaciones Generales */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-base">✅</span>
                  Recomendaciones Generales
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Ejecuta primero el Smoke Test para verificar funcionalidad básica</li>
                  <li>• Luego el Load Test para validar rendimiento bajo carga normal</li>
                  <li>• Stress Test te ayudará a encontrar el punto de quiebre del sistema</li>
                  <li>• Spike Test valida la capacidad de recuperación ante picos súbitos</li>
                  <li>• Monitorea CPU, memoria y conexiones de BD durante las pruebas</li>
                  <li>• Observa el RPS real de K6 (pasa el mouse sobre el ícono ⓘ para más info)</li>
                </ul>
              </div>

              {/* Sección: Configuración Avanzada */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-base">⚙️</span>
                  Configuración Avanzada
                </h4>

                {/* Explicación de Stages (Fases) */}
                <details className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                <summary className="text-gray-900 font-semibold text-sm cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                  <span className="text-base">⏱️</span>
                  <span>Cálculo de Fases: Ramp-up, Stay y Ramp-down</span>
                </summary>
                <div className="text-gray-700 text-xs space-y-3 mt-3">
                  <p>
                    Las <span className="font-semibold">fases (stages)</span> controlan cómo evoluciona la carga durante la prueba. Los valores sugeridos dependen del tipo de prueba y tus objetivos:
                  </p>

                  <div className="bg-white rounded p-3 border border-gray-300">
                    <p className="font-semibold text-gray-900 mb-1">1️⃣ Ramp-up (Arranque gradual)</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="font-semibold">Duración sugerida:</span> 2-5 minutos para Load/Stress Test, 30-60s para Spike Test
                      </li>
                      <li>
                        <span className="font-semibold">Target:</span> 50-70% de los VUs finales (ej: {Math.ceil(baseVUs * 0.5)} VUs para llegar a {baseVUs} VUs)
                      </li>
                      <li>
                        <span className="font-semibold">Por qué:</span> Evita sobrecargar el sistema de golpe. Permite que auto-scalers, caches y conexiones se inicialicen gradualmente.
                      </li>
                      <li>
                        <span className="font-semibold">Ajusta si:</span> Tu sistema tiene auto-scaling (aumenta a 5-10m), o si usas CDN/cache (1-2m puede ser suficiente).
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded p-3 border border-gray-300">
                    <p className="font-semibold text-gray-900 mb-1">2️⃣ Stay (Permanencia en pico)</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="font-semibold">Duración sugerida:</span> {loadTestDurationNum}min (Load Test), {stressTestDurationNum}min (Stress), {spikeTestDurationNum}min (Spike)
                      </li>
                      <li>
                        <span className="font-semibold">Target:</span> Los VUs calculados según el tipo de prueba
                      </li>
                      <li>
                        <span className="font-semibold">Por qué:</span> Necesitas tiempo suficiente para que las métricas se estabilicen y detectar memory leaks, degradación progresiva o problemas de recursos.
                      </li>
                      <li>
                        <span className="font-semibold">Ajusta si:</span> Sospechas memory leaks (aumenta a 45-60m), pruebas de endurance (varias horas), o solo verificación rápida (5-10m).
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded p-3 border border-gray-300">
                    <p className="font-semibold text-gray-900 mb-1">3️⃣ Ramp-down (Descenso gradual)</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="font-semibold">Duración sugerida:</span> 2-3 minutos
                      </li>
                      <li>
                        <span className="font-semibold">Target:</span> 0 VUs (detener la carga gradualmente)
                      </li>
                      <li>
                        <span className="font-semibold">Por qué:</span> Evita cortar conexiones abruptamente. Permite observar cómo se recupera el sistema cuando la carga disminuye.
                      </li>
                      <li>
                        <span className="font-semibold">Ajusta si:</span> Quieres observar recuperación del sistema (aumenta a 5-10m), o si no te importa la recuperación (puedes usar 30s-1m).
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-100 rounded p-3 border border-gray-400 mt-2">
                    <p className="font-semibold text-gray-900 mb-1">🎯 Regla general:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="font-semibold">Sistemas con auto-scaling:</span> Ramp-up más largo (5-10m) para dar tiempo a escalar
                      </li>
                      <li>
                        <span className="font-semibold">Sistemas sin auto-scaling:</span> Ramp-up estándar (2-3m)
                      </li>
                      <li>
                        <span className="font-semibold">Spike Tests:</span> Ramp-up muy corto (30-60s) para simular picos súbitos reales
                      </li>
                      <li>
                        <span className="font-semibold">Endurance Tests:</span> Stay prolongado (2-8 horas) para detectar memory leaks
                      </li>
                    </ul>
                  </div>

                  <p className="text-gray-900 font-semibold mt-2 bg-gray-100 p-2 rounded border border-gray-400">
                    💡 Los valores en el script son <span className="underline">sugerencias iniciales</span>. Ajústalos según la arquitectura de tu sistema, tipo de prueba y tiempo disponible para ejecutarla.
                  </p>
                </div>
              </details>

              {/* Explicación de Thresholds */}
              <details className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-300">
                <summary className="text-gray-900 font-semibold text-sm cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <span>Configuración de Thresholds (Umbrales)</span>
                </summary>
                <div className="text-gray-700 text-xs space-y-2 mt-3">
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
              </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
