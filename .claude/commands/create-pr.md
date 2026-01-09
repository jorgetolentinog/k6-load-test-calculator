---
Crear Pull Request en GitHub analizando commits de la rama
allowed-tools: [Bash(git status, git branch, git log, git checkout, gh pr create), Read]
---

# Crear Pull Request en GitHub

## Flujo de creación de PR (no-interactivo)

### Paso 1: Validar estado y rama actual

```bash
# Rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Status de cambios sin commitear
git status --porcelain
```

**Si hay cambios sin commitear:**
- Mostrar listado de cambios
- Preguntar: ¿Deseas commitear cambios antes del PR? (Sí/No/Cancelar)
  - Si Sí: Esperar input del usuario o rechazar si no hay commits pendientes
  - Si Cancelar: Abortear proceso

### Paso 2: Detectar rama main/master y crear rama nueva si es necesario

```bash
if [ "$CURRENT_BRANCH" == "main" ] || [ "$CURRENT_BRANCH" == "master" ]; then
  # Avisar que estamos en main/master
  echo "⚠️ Estás en rama $CURRENT_BRANCH - No se puede crear PR desde aquí"

  # Solicitar nombre de rama nueva
  # Ejemplo: feature/add-login, fix/bug-123

  # Crear rama nueva
  git checkout -b <nombre-rama>
fi
```

### Paso 3: Analizar commits del PR para generar título y descripción

```bash
# Detectar rama principal (main o master)
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
if [ -z "$BASE_BRANCH" ]; then
  # Fallback: intentar detectar main o master
  if git show-ref --verify --quiet refs/heads/main; then
    BASE_BRANCH="main"
  elif git show-ref --verify --quiet refs/heads/master; then
    BASE_BRANCH="master"
  else
    BASE_BRANCH="main"  # Default
  fi
fi

# Obtener commits que no están en la rama base
git log ${BASE_BRANCH}..HEAD --oneline
```

**Analizar commits para:**
- **Título**: Usar primer commit o resumir patrón común
  - Si todos los commits tienen prefijo (feat:, fix:, refactor:), usar ese patrón
  - Sino, resumir en máximo 72 caracteres
  - **Ignorar commits "wip"** al generar el título

- **Descripción**:
  - Listar todos los commits **excepto los "wip"**
  - Extraer mensajes descriptivos
  - Formar descripción coherente en markdown
  - Incluir: qué se cambió, por qué, cómo
  - Si solo hay commits "wip", analizar los archivos cambiados (`git diff`) para generar descripción

**Patrones de commits a ignorar:**
- `wip`
- `WIP`
- `wip:`, `WIP:`
- Mensajes genéricos: `update`, `fix`, `changes`, `tmp`, `temp`

**Ejemplo 1 (con commits descriptivos):**
```
Commits encontrados:
- feat: add user authentication
- wip
- test: add auth tests
- wip: testing
- docs: update README with auth instructions

Commits útiles (sin wip):
- feat: add user authentication
- test: add auth tests
- docs: update README with auth instructions

Título generado: Add user authentication
Descripción: Implementation of user authentication system with tests and documentation
```

**Ejemplo 2 (solo commits wip):**
```
Commits encontrados:
- wip
- wip
- wip: more changes

⚠️ Solo commits "wip" encontrados
→ Analizando archivos modificados con git diff...

Archivos modificados:
- src/auth/login.ts (nuevo)
- src/auth/jwt.ts (nuevo)
- tests/auth.test.ts (nuevo)

Título sugerido: Add authentication module
Descripción: Added authentication functionality based on modified files
```

### Paso 4: Confirmar rama y cambios antes de crear PR

Mostrar al usuario:
```
┌─ INFORMACIÓN DEL PR ─────────────────
│ Rama: feature/add-auth
│ Base: main
│ Commits: 3
│
│ Título: Add user authentication
│
│ Descripción:
│ Implementation of user authentication system
│ - Added login/logout functionality
│ - Added JWT token validation
│ - Updated database schema
│
│ ¿Proceder a crear el PR? (Sí/No)
└──────────────────────────────────────
```

### Paso 5: Crear PR de forma no-interactiva

```bash
gh pr create \
  --title "Título del PR" \
  --body "$(cat <<'EOF'
Descripción multi-línea
con todos los detalles

## Changes
- Item 1
- Item 2

## Testing
Como se testeó

## Related Issues
Closes #123
EOF
)" \
  --base main
```

### Paso 6: Validar resultado

Si `gh pr create` retorna exitosamente:
```bash
# Capturar URL del PR
gh pr view --json url --jq '.url'
```

Mostrar:
```
✅ PR creado exitosamente!
📎 URL: https://github.com/user/repo/pull/42
🔗 Número: #42
📤 Rama: feature/add-auth → main
```

---

## Validaciones y Manejo de Errores

### Pre-requisitos
- [ ] Repository es git repo: `git rev-parse --git-dir`
- [ ] GitHub CLI instalado: `which gh`
- [ ] Usuario autenticado: `gh auth status`
- [ ] Rama remota existe o hacer `git push -u origin <rama>` primero

### Errores a manejar
- ❌ `Not a git repository` → Abortar
- ❌ `gh: command not found` → Instruir instalación
- ❌ `Authentication failed` → Instruir `gh auth login`
- ❌ `Branch does not exist` → Ofrecer hacer push primero
- ❌ `PR already exists` → Avisar que ya existe PR para esta rama

---

## Flujo Completo

```
START
  ↓
1. git status (cambios pendientes?)
  ├─ Sí: Confirmar con usuario
  └─ No: Continuar
  ↓
2. Detectar rama actual
  ├─ main/master: Crear rama nueva
  └─ otra: Continuar
  ↓
3. git log --oneline (analizar commits)
  ├─ Generar título
  └─ Generar descripción
  ↓
4. Mostrar resumen al usuario
  ├─ Confirmar: Sí → siguiente
  └─ Rechazar: Abortear
  ↓
5. gh pr create (no-interactivo)
  ├─ Éxito: mostrar URL y finalizar
  └─ Error: reportar error y sugerir solución
  ↓
END
```

---

## Ejemplo de Ejecución

```
$ create-pr

📋 Verificando estado...
✓ Rama actual: feature/add-calculator
✓ 0 cambios sin commitear

🔍 Analizando commits...
✓ 2 commits encontrados
  - feat: add calculator component
  - test: add calculator tests

📝 Generando título y descripción...

┌─ RESUMEN DEL PR ─────────────────
│ Rama: feature/add-calculator
│ Base: main
│ Commits: 2
│
│ Título: Add calculator component
│
│ Descripción:
│ Added new calculator component with basic arithmetic operations
│
│ - Calculator component with +,-,*,/ operations
│ - Unit tests for all operations
│ - Error handling for invalid inputs
│
│ ¿Crear PR? (s/n): s
└──────────────────────────────────

✅ PR creado exitosamente!
📎 URL: https://github.com/jorge/k6calc/pull/1
🔗 Número: #1
📤 Rama: feature/add-calculator → main
```

---

## Ahora: Ejecuta el flujo completo

1. Verifica git status y rama actual
2. Valida que no sea main/master (o crea rama nueva)
3. Extrae y analiza commits con `git log`
4. Genera título y descripción automáticamente
5. Pide confirmación al usuario
6. Crea PR con `gh pr create` de forma no-interactiva
7. Muestra resultado con URL del PR
