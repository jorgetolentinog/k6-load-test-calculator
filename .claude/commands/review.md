---
Code review completo enfocado en React 19, TypeScript, Performance y Calidad
allowed-tools: [Read, Grep, Bash(git diff, git status)]
---

# Revisión de Código Completa

Analizá los archivos modificados con enfoque exhaustivo en:

## 1. React Best Practices (React 19.2.3)

### Componentes
- Detectar componentes muy grandes (>300 líneas). Sugerir división en componentes más pequeños
- Verificar que 'use client' esté al inicio del archivo si usa hooks
- Verificar que componentes Server tengan async cuando corresponda
- Validar que props estén bien tipadas con interfaces/types

### Hooks
- Verificar dependencias de `useEffect`, `useMemo`, `useCallback`, etc. - deben ser completas
- Detectar efectos innecesarios o que podrían combinarse
- Validar cleanup functions en useEffect cuando sea necesario
- Verificar que no haya hooks dentro de condicionales o loops

### Re-renders y Performance
- Detectar funciones inline en props sin `useCallback` (especialmente cuando se pasan a componentes memoizados)
- Identificar objetos/arrays creados inline en el render que deberían estar memoizados
- Detectar cálculos complejos en el component body sin `useMemo`

- Notar cuando se itera sin key o con index como key

### Otros patrones React
- Verificar uso correcto de refs (useRef)
- Detectar state que podría ser derivado (no debería estar en state)
- Notar si hay props drilling excesivo que amerite Context API

## 2. TypeScript/Tipos

### Tipos y Interfaces
- Buscar uso explícito de `any` - SIEMPRE marcar como HIGH
- Detectar funciones exportadas sin return type - marcar como MEDIUM
- Validar que componentes tengan interfaces para props
- Detectar type assertions (`as Type`) excesivos - preferir type guards

### Validación en Runtime
- Buscar `parseFloat`, `parseInt` sin validación de NaN (usar `parseFloat(x) || 0` o `isNaN` check)
- Detectar `JSON.parse` sin try/catch
- Notar acceso a propiedades sin optional chaining (`?.`) cuando podrían ser undefined

### Otros issues TypeScript
- Type imports vs regular imports (si hay muchos types, considerar separate)
- Generics sin constraints explícitos cuando deberían haberlas
- Enums vs union types (considerar si los enums son necesarios)

## 3. Performance

### Cálculos y Memoización
- Identificar cálculos costosos (Math operations, transformaciones de arrays) en el component body
- Detectar que se recalcule en cada render algo que es derivado de props/state
- Sugerir `useMemo` para cálculos, `useCallback` para handlers pasados como props

### Bundle y Imports
- Detectar `import * as ...` de librerías grandes
- Notar imports innecesarios (módulos sin usar)
- Considerar dynamic imports para componentes pesados

### Renders Innecesarios
- Detectar componentes que re-renderizan sin cambios en props
- Sugerir `React.memo` para componentes costosos con stable props
- Notar si hay children siendo recalculados cuando no cambian

## 4. Calidad de Código y Legibilidad

### Estructura y Legibilidad
- Detectar funciones demasiado largas (>50 líneas) - sugerir división
- Notar ternarios anidados (>2 niveles) - considerar if/else o switch
- Identificar indentación y formatos inconsistentes
- Detectar comentarios obsoletos o innecesarios

### Código Limpio
- Buscar duplicación de código - bloques similares repetidos 3+ veces
- Detectar magic numbers sin nombres descriptivos (excepto 0, 1, -1, 2π, etc)
- Validar que nombres de variables/funciones sean descriptivos
- Notar variables no usadas o imports sin usar

### Typos y Errores Simples
- Detectar typos en comentarios (especialmente públicos para usuarios)
- Buscar typos en strings de UI/labels
- Notar misspellings en nombres de variables que podrían confundir

## 5. Next.js 16 Específico

- Verificar uso correcto de `use client` / `use server` directivas
- Detectar si Server Components se están usando donde deberían
- Validar que no haya imports de cliente en Server Components
- Verificar metadata, redirects, y route handlers correctamente

---

## Proceso de Revisión

### Paso 1: Obtener archivos modificados
```bash
git diff --name-only HEAD
```

Filtra solo archivos `.tsx`, `.ts`, `.jsx`, `.js` (ignora node_modules, .next, etc)

### Paso 2: Para cada archivo
1. Lee el archivo completo
2. Analiza contra TODOS los patrones arriba
3. Categoriza cada issue con:
   - **Archivo**: path relativo
   - **Línea(s)**: dónde está el problema
   - **Severidad**: CRITICAL | HIGH | MEDIUM | LOW
   - **Categoría**: React / TypeScript / Performance / Code Quality
   - **Problema**: Descripción clara qué está mal y por qué
   - **Sugerencia**: Cómo arreglarlo con ejemplo de código

### Paso 3: Génera reporte estructurado

---

## Formato del Reporte

```markdown
# Code Review Report

## 📊 Resumen Ejecutivo
- **Archivos analizados**: X
- **Total issues encontrados**: Y
- **Desglose**: CRITICAL (N) | HIGH (M) | MEDIUM (K) | LOW (L)

---

## 🔴 CRITICAL Issues
[Lista aquí solo si existen]

### Ejemplo: Componente excesivamente grande
- **Archivo:Líneas** - [path/Component.tsx:1-850](path/Component.tsx#L1-L850)
  - **Problema**: Componente de 850+ líneas con múltiples responsabilidades, demasiado state y lógica acoplada
  - **Impacto**: Difícil de mantener, testear y reutilizar; problemas de performance por re-renders innecesarios
  - **Sugerencia**: Aplicar Single Responsibility Principle dividiendo en componentes más pequeños:
    ```typescript
    // Dividir según responsabilidades:
    - components/InputSection.tsx
    - components/DataDisplay.tsx
    - components/ActionPanel.tsx
    - components/ResultsSummary.tsx
    - hooks/useBusinessLogic.ts
    ```

### Ejemplo: Security vulnerability
- **Archivo:Líneas** - [api/user.ts:45](api/user.ts#L45)
  - **Problema**: SQL injection vulnerability usando string concatenation
  - **Impacto**: CRÍTICO - permite ejecución arbitraria de código SQL
  - **Código actual**:
    ```typescript
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    ```
  - **Sugerencia**: Usar prepared statements o query builders:
    ```typescript
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId]);
    ```

---

## 🟠 HIGH Issues

### Ejemplo: Parsing sin validación
- **Archivo:Líneas** - [utils/calculator.ts:23-30](utils/calculator.ts#L23-L30)
  - **Problema**: `parseFloat()`, `parseInt()` sin validación de NaN
  - **Impacto**: Cálculos incorrectos propagándose en la aplicación (NaN * número = NaN)
  - **Código actual**:
    ```typescript
    const value = parseFloat(input);
    const result = value * multiplier;
    ```
  - **Sugerencia**: Validar y proporcionar defaults:
    ```typescript
    const value = parseFloat(input) || 0;
    const multiplier = parseFloat(mult) || 1;
    const result = value * multiplier;
    // O con validación explícita:
    const parsed = parseFloat(input);
    const value = isNaN(parsed) ? 0 : parsed;
    ```

### Ejemplo: Type safety violation
- **Archivo:Líneas** - [services/api.ts:67](services/api.ts#L67)
  - **Problema**: Uso de `any` en función exportada
  - **Impacto**: Pérdida total de type safety, dificulta refactoring y mantenimiento
  - **Código actual**:
    ```typescript
    export function processData(data: any) { ... }
    ```
  - **Sugerencia**: Definir tipos apropiados:
    ```typescript
    interface ProcessableData {
      id: string;
      value: number;
      metadata?: Record<string, unknown>;
    }
    export function processData(data: ProcessableData) { ... }
    ```

---

## 🟡 MEDIUM Issues

### Ejemplo: Cálculos sin memoización
- **Archivo:Líneas** - [components/Dashboard.tsx:45-60](components/Dashboard.tsx#L45-L60)
  - **Problema**: Cálculos complejos re-ejecutándose en cada render
  - **Impacto**: Performance degradada, especialmente en interacciones frecuentes
  - **Sugerencia**: Usar `useMemo` para cálculos derivados:
    ```typescript
    const expensiveCalculation = useMemo(() => {
      const processed = data.map(item => complexTransform(item));
      const aggregated = processed.reduce((acc, val) => acc + val.metric, 0);
      return { processed, total: aggregated };
    }, [data]); // Solo recalcular cuando 'data' cambie
    ```

### Ejemplo: Missing error handling
- **Archivo:Líneas** - [utils/storage.ts:12](utils/storage.ts#L12)
  - **Problema**: `JSON.parse()` sin manejo de errores
  - **Impacto**: Crash de la app si el JSON está corrupto
  - **Sugerencia**: Agregar try/catch:
    ```typescript
    try {
      const data = JSON.parse(jsonString);
      return data;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return defaultValue;
    }
    ```

---

## 🔵 LOW Issues

### Ejemplo: Missing prop types
- **Archivo:Líneas** - [components/Tooltip.tsx:5](components/Tooltip.tsx#L5)
  - **Problema**: Componente sin interface de props definida
  - **Impacto**: Menor - dificulta la documentación y autocomplete
  - **Sugerencia**: Documentar props explícitamente:
    ```typescript
    interface TooltipProps {
      content: string;
      position?: 'top' | 'bottom' | 'left' | 'right';
      children: React.ReactNode;
    }

    function Tooltip({ content, position = 'top', children }: TooltipProps) {
      // ...
    }
    ```

### Ejemplo: Magic numbers
- **Archivo:Líneas** - [utils/constants.ts:8](utils/constants.ts#L8)
  - **Problema**: Números mágicos sin nombres descriptivos
  - **Impacto**: Menor - reduce legibilidad del código
  - **Código actual**:
    ```typescript
    if (timeout > 5000) { ... }
    ```
  - **Sugerencia**: Usar constantes nombradas:
    ```typescript
    const MAX_TIMEOUT_MS = 5000;
    if (timeout > MAX_TIMEOUT_MS) { ... }
    ```

---

## 📋 Recomendaciones Generales

### Arquitectura y Estructura
1. **Refactoring de componentes grandes**: Dividir archivos >300 líneas aplicando Single Responsibility Principle
2. **Separación de responsabilidades**: Extraer lógica de negocio a custom hooks, servicios o utilities
3. **Estructura de carpetas**: Considerar organización por features/modules en lugar de por tipo de archivo

### Type Safety
1. **Eliminar `any`**: Reemplazar todos los `any` con tipos específicos o `unknown` donde sea apropiado
2. **Definir interfaces**: Todas las props de componentes, parámetros de funciones exportadas y respuestas de API deben estar tipadas
3. **Runtime validation**: Agregar validación a parsing (`parseFloat`, `parseInt`, `JSON.parse`) y datos externos

### Performance
1. **Memoización estratégica**: Usar `useMemo` para cálculos costosos, `useCallback` para funciones pasadas como props
2. **Optimización de re-renders**: Considerar `React.memo` para componentes que reciben stable props
3. **Code splitting**: Implementar lazy loading para componentes/rutas pesadas

### Code Quality
1. **Reducir duplicación**: Extraer código repetido a funciones reutilizables
2. **Constantes nombradas**: Reemplazar magic numbers y strings con constantes descriptivas
3. **Error handling**: Implementar manejo de errores consistente en operaciones que pueden fallar

### Testing & Maintainability
1. **Priorizar testabilidad**: Componentes pequeños y funciones puras son más fáciles de testear
2. **Documentación**: Comentar decisiones arquitectónicas complejas, no código obvio
3. **Naming conventions**: Usar nombres descriptivos y consistentes en todo el proyecto

---

## ❓ Próximos Pasos

¿Necesitás ayuda para implementar alguna de estas mejoras? Puedo:
- Refactorizar componentes grandes en módulos más pequeños
- Agregar tipos faltantes o mejorar type safety
- Optimizar performance con memoización
- Implementar error handling robusto
```

---

## 🎯 Guía de Severidades

- **[CRITICAL]** - Rompe funcionalidad, security issues, type safety violations (bugs)
- **[HIGH]** - Probable que cause bugs, performance issues, problemas de mantenibilidad
- **[MEDIUM]** - Code smells, oportunidades de optimización, deuda técnica
- **[LOW]** - Style issues, mejoras menores, nice-to-haves

---

## ⚠️ Notas Importantes

- **Sé específico**: Incluye archivo:línea en cada issue
- **Sé útil**: Cada suggestion debe tener código de ejemplo
- **Sé contextual**: Explica el WHY, no solo el WHAT
- **Evita falsos positivos**: Si el cleanup de useEffect es correcto, no lo flagguees como problema
- **Respeta convenciones**: Next.js app router patterns son válidos
- **Sé pragmático**: Focus en issues reales, no estilos personales

---

## Ahora: Analiza los cambios en este proyecto

1. Ejecuta `git diff --name-only HEAD` para ver qué archivos cambiaron
2. Lee cada archivo .tsx/.ts/.jsx/.js modificado
3. Analiza contra TODOS los patrones arriba
4. Genera el reporte en el formato especificado
5. Ofrece ayuda para los issues HIGH y CRITICAL
