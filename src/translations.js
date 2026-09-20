// Hybrid Matrix — EN/ES Translation Dictionary
// Spanish fitness terminology sourced from: fitnessrevolucionario.com,
// underarmour.com.mx, musculacion.net, mundoentrenamiento.com

const translations = {
  en: {
    // ── Brand ──
    brand: "HYBRID MATRIX",
    tagline: "CORE ENGINE v2.0",
    tagline_hero: "SCIENCE-BASED · AI POWERED · BILINGUAL EN/ES",
    hero_title_1: "HYBRID",
    hero_title_2: "MATRIX",
    hero_sub: "Your body adapts to everything. Your program should too. AI-driven training built from real science.",

    // ── Nav ──
    login: "Log In",
    register: "Register",
    start_free: "START FREE",
    logout: "Logout",
    admin: "Admin",
    back: "Back",
    cancel: "Cancel",

    // ── Auth ──
    full_name: "Full name",
    email: "Email",
    password: "Password",
    processing: "Processing...",
    create_account: "Create Account",
    enter_matrix: "Enter Matrix",
    forgot_password: "Forgot password?",
    reset_password_title: "Reset Password",
    reset_password_sub: "Enter your email and we'll send a reset link.",
    send_reset: "Send Reset Link",
    sending: "Sending...",
    set_new_password: "Set New Password",
    set_new_password_sub: "Choose a new password for your account.",
    new_password: "New password",
    confirm_password: "Confirm password",
    update_password: "Update Password",
    updating: "Updating...",
    password_updated: "Password Updated",
    password_updated_sub: "You can now log in with your new password.",
    back_to_login: "Back to Login",
    passwords_no_match: "Passwords don't match.",
    no_account_found: "No account found with that email.",
    something_wrong: "Something went wrong. Try again.",

    // ── Onboarding ──
    personalizing: "PERSONALIZING YOUR MATRIX",
    welcome: "WELCOME,",
    question_of: "QUESTION {n} OF {total}",
    onboarding_note: "YOUR ANSWERS PERSONALIZE YOUR PROGRAM LIBRARY",

    // ── Onboarding Questions ──
    q_goal: "What is your primary goal?",
    q_experience: "What is your training experience?",
    q_days: "How many days per week can you train?",
    q_gender: "Which program library fits you best?",
    q_limitation: "Any physical limitations or injuries?",

    // ── Goal options ──
    goal_fat_loss: "Fat Loss",
    goal_muscle: "Muscle & Strength",
    goal_athletic: "Athletic Performance",
    goal_general: "General Fitness",
    goal_glutes: "Glutes & Lower Body",

    // ── Experience options ──
    exp_beginner: "Beginner (0-1 year)",
    exp_intermediate: "Intermediate (1-3 years)",
    exp_advanced: "Advanced (3+ years)",

    // ── Days options ──
    days_3: "3 days",
    days_4: "4 days",
    days_5: "5 days",
    days_6: "6 days",

    // ── Gender options ──
    gender_mens: "Men's Programs",
    gender_womens: "Women's Programs",
    gender_both: "Both",

    // ── Limitation options ──
    limit_none: "None",
    limit_back: "Lower back issues",
    limit_knee: "Knee issues",
    limit_shoulder: "Shoulder issues",
    limit_other: "Other / Multiple",

    // ── Dashboard ──
    welcome_back: "WELCOME BACK",
    matrix_ready: "YOUR TRAINING MATRIX IS READY",
    current_tier: "CURRENT TIER",
    programs_matched: "{n} programs matched to your goals",
    retake_quiz: "RETAKE QUIZ →",
    ai_generate: "⚡ AI GENERATE →",

    // ── Filters ──
    filter_all: "All",
    filter_fat_loss: "Fat Loss",
    filter_hypertrophy: "Hypertrophy",
    filter_strength: "Strength",
    filter_athletic: "Athletic",
    filter_general: "General Fitness",
    filter_glutes: "Glutes",

    // ── Program list ──
    all_programs: "ALL PROGRAMS",
    programs_results: "{category} PROGRAMS — {n} RESULTS",
    loading_programs: "Loading programs...",

    // ── Program card ──
    level: "LEVEL",
    duration: "DURATION",
    days_per_week: "DAYS/WK",
    gender: "GENDER",
    weeks_short: "{n} wks",

    // ── Program detail ──
    program_overview: "PROGRAM OVERVIEW",
    tags: "TAGS",
    start_program: "START PROGRAM →",
    intensity: "INTENSITY",
    weeks_label: "{n} weeks",
    structured_program: "{n}-week structured program",
    training_days: "{n} training days per week",
    intensity_level: "{level} intensity level",
    science_overload: "Science-based progressive overload",
    full_library: "Full exercise library with sets and reps",
    video_demos: "Video demos for every exercise",

    // ── Workout view ──
    week_day: "{cat} — WEEK 1 DAY {day}",
    workout_progress: "Workout Progress",
    complete_pct: "{n}% Complete",
    sets: "SETS",
    reps_label: "REPS",
    rest: "REST",
    exercises: "EXERCISES",
    exercises_tap: "EXERCISES — TAP SETS TO LOG",
    loading_workout: "Loading workout...",
    reps_unit: "{n} reps",
    workout_complete: "Workout Complete!",
    day_logged: "Day {n} logged.",
    back_to_programs: "Back to Programs",
    day_nav: "Day {n}",
    watch: "WATCH",
    rir: "RIR",

    // ── AI Generator ──
    ai_panel: "AI EXPERT PANEL",
    ai_title: "Your Science-Based Program",
    ai_sub: "Built for your goals, experience, and schedule.",
    your_profile: "YOUR PROFILE",
    goal_label: "GOAL",
    experience_label: "EXPERIENCE",
    days_week_label: "DAYS/WEEK",
    limitations_label: "LIMITATIONS",
    ai_description: "A customized program rooted in periodization, biomechanics, and proven training science — generated just for you.",
    generate_btn: "Generate My Program →",
    generating: "Building your program...",
    start_this_program: "Start This Program →",
    regenerate: "Regenerate",
    progression: "PROGRESSION",
    coaching_tip: "💡",

    // ── Admin ──
    admin_panel: "ADMIN",
    control_panel: "Control Panel",
    total_users: "Total Users",
    workouts_logged: "Workouts Logged",
    ai_programs_built: "AI Programs Built",
    new_today: "New Today",
    users_by_tier: "USERS BY TIER",
    all_users: "ALL USERS",
    search_users: "Search by name or email...",
    loading_users: "Loading users...",

    // ── Landing ──
    program_library: "PROGRAM LIBRARY",
    browse_smarter: "BROWSE FREE. TRAIN SMARTER.",
    browse_sub: "Sign up free. Answer 5 questions. We match you to the right program instantly.",
    get_started: "GET STARTED TODAY",
    your_results: "YOUR PROGRAM. YOUR RESULTS.",
    your_results_sub: "Answer 5 questions. We match you to the right program instantly.",
    create_free: "CREATE FREE ACCOUNT →",
    start_for_free: "START FOR FREE →",
    view_programs: "VIEW PROGRAMS",
    footer_copy: "© 2026 HYBRID MATRIX. ALL RIGHTS RESERVED.",
    footer_sub: "SCIENCE-BASED · AI POWERED · EN/ES",
  },

  es: {
    // ── Brand ──
    brand: "HYBRID MATRIX",
    tagline: "MOTOR CENTRAL v2.0",
    tagline_hero: "BASADO EN CIENCIA · IMPULSADO POR IA · BILINGÜE EN/ES",
    hero_title_1: "HYBRID",
    hero_title_2: "MATRIX",
    hero_sub: "Tu cuerpo se adapta a todo. Tu programa también debería. Entrenamiento con IA basado en ciencia real.",

    // ── Nav ──
    login: "Iniciar sesión",
    register: "Registrarse",
    start_free: "EMPIEZA GRATIS",
    logout: "Cerrar sesión",
    admin: "Admin",
    back: "Volver",
    cancel: "Cancelar",

    // ── Auth ──
    full_name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    processing: "Procesando...",
    create_account: "Crear cuenta",
    enter_matrix: "Entrar al Matrix",
    forgot_password: "¿Olvidaste tu contraseña?",
    reset_password_title: "Restablecer contraseña",
    reset_password_sub: "Ingresa tu correo y te enviaremos un enlace.",
    send_reset: "Enviar enlace",
    sending: "Enviando...",
    set_new_password: "Nueva contraseña",
    set_new_password_sub: "Elige una nueva contraseña para tu cuenta.",
    new_password: "Nueva contraseña",
    confirm_password: "Confirmar contraseña",
    update_password: "Actualizar contraseña",
    updating: "Actualizando...",
    password_updated: "Contraseña actualizada",
    password_updated_sub: "Ya puedes iniciar sesión con tu nueva contraseña.",
    back_to_login: "Volver al inicio de sesión",
    passwords_no_match: "Las contraseñas no coinciden.",
    no_account_found: "No encontramos una cuenta con ese correo.",
    something_wrong: "Algo salió mal. Inténtalo de nuevo.",

    // ── Onboarding ──
    personalizing: "PERSONALIZANDO TU MATRIX",
    welcome: "BIENVENIDO,",
    question_of: "PREGUNTA {n} DE {total}",
    onboarding_note: "TUS RESPUESTAS PERSONALIZAN TU BIBLIOTECA DE PROGRAMAS",

    // ── Onboarding Questions ──
    q_goal: "¿Cuál es tu objetivo principal?",
    q_experience: "¿Cuál es tu experiencia de entrenamiento?",
    q_days: "¿Cuántos días por semana puedes entrenar?",
    q_gender: "¿Qué biblioteca de programas se adapta mejor a ti?",
    q_limitation: "¿Tienes alguna limitación física o lesión?",

    // ── Goal options ──
    goal_fat_loss: "Pérdida de grasa",
    goal_muscle: "Músculo y fuerza",
    goal_athletic: "Rendimiento atlético",
    goal_general: "Fitness general",
    goal_glutes: "Glúteos y tren inferior",

    // ── Experience options ──
    exp_beginner: "Principiante (0-1 año)",
    exp_intermediate: "Intermedio (1-3 años)",
    exp_advanced: "Avanzado (3+ años)",

    // ── Days options ──
    days_3: "3 días",
    days_4: "4 días",
    days_5: "5 días",
    days_6: "6 días",

    // ── Gender options ──
    gender_mens: "Programas para hombres",
    gender_womens: "Programas para mujeres",
    gender_both: "Ambos",

    // ── Limitation options ──
    limit_none: "Ninguna",
    limit_back: "Problemas de espalda baja",
    limit_knee: "Problemas de rodilla",
    limit_shoulder: "Problemas de hombro",
    limit_other: "Otra / Múltiples",

    // ── Dashboard ──
    welcome_back: "BIENVENIDO DE NUEVO",
    matrix_ready: "TU MATRIX DE ENTRENAMIENTO ESTÁ LISTO",
    current_tier: "NIVEL ACTUAL",
    programs_matched: "{n} programas según tus objetivos",
    retake_quiz: "REPETIR CUESTIONARIO →",
    ai_generate: "⚡ GENERAR CON IA →",

    // ── Filters ──
    filter_all: "Todos",
    filter_fat_loss: "Pérdida de grasa",
    filter_hypertrophy: "Hipertrofia",
    filter_strength: "Fuerza",
    filter_athletic: "Atlético",
    filter_general: "Fitness general",
    filter_glutes: "Glúteos",

    // ── Program list ──
    all_programs: "TODOS LOS PROGRAMAS",
    programs_results: "PROGRAMAS DE {category} — {n} RESULTADOS",
    loading_programs: "Cargando programas...",

    // ── Program card ──
    level: "NIVEL",
    duration: "DURACIÓN",
    days_per_week: "DÍAS/SEM",
    gender: "GÉNERO",
    weeks_short: "{n} sem",

    // ── Program detail ──
    program_overview: "RESUMEN DEL PROGRAMA",
    tags: "ETIQUETAS",
    start_program: "INICIAR PROGRAMA →",
    intensity: "INTENSIDAD",
    weeks_label: "{n} semanas",
    structured_program: "Programa estructurado de {n} semanas",
    training_days: "{n} días de entrenamiento por semana",
    intensity_level: "Nivel de intensidad {level}",
    science_overload: "Sobrecarga progresiva basada en ciencia",
    full_library: "Biblioteca completa con series y repeticiones",
    video_demos: "Videos demostrativos para cada ejercicio",

    // ── Workout view ──
    week_day: "{cat} — SEMANA 1 DÍA {day}",
    workout_progress: "Progreso del entrenamiento",
    complete_pct: "{n}% Completado",
    sets: "SERIES",
    reps_label: "REPS",
    rest: "DESCANSO",
    exercises: "EJERCICIOS",
    exercises_tap: "EJERCICIOS — TOCA SERIES PARA REGISTRAR",
    loading_workout: "Cargando entrenamiento...",
    reps_unit: "{n} reps",
    workout_complete: "¡Entrenamiento completado!",
    day_logged: "Día {n} registrado.",
    back_to_programs: "Volver a programas",
    day_nav: "Día {n}",
    watch: "VER",
    rir: "RIR",

    // ── AI Generator ──
    ai_panel: "PANEL DE EXPERTOS IA",
    ai_title: "Tu Programa Basado en Ciencia",
    ai_sub: "Diseñado para tus objetivos, experiencia y horario.",
    your_profile: "TU PERFIL",
    goal_label: "OBJETIVO",
    experience_label: "EXPERIENCIA",
    days_week_label: "DÍAS/SEMANA",
    limitations_label: "LIMITACIONES",
    ai_description: "Un programa personalizado basado en periodización, biomecánica y metodología de entrenamiento probada — generado solo para ti.",
    generate_btn: "Generar mi programa →",
    generating: "Construyendo tu programa...",
    start_this_program: "Iniciar este programa →",
    regenerate: "Regenerar",
    progression: "PROGRESIÓN",
    coaching_tip: "💡",

    // ── Admin ──
    admin_panel: "ADMIN",
    control_panel: "Panel de control",
    total_users: "Usuarios totales",
    workouts_logged: "Entrenamientos registrados",
    ai_programs_built: "Programas IA creados",
    new_today: "Nuevos hoy",
    users_by_tier: "USUARIOS POR NIVEL",
    all_users: "TODOS LOS USUARIOS",
    search_users: "Buscar por nombre o correo...",
    loading_users: "Cargando usuarios...",

    // ── Landing ──
    program_library: "BIBLIOTECA DE PROGRAMAS",
    browse_smarter: "EXPLORA GRATIS. ENTRENA MÁS INTELIGENTE.",
    browse_sub: "Regístrate gratis. Responde 5 preguntas. Te asignamos el programa ideal al instante.",
    get_started: "EMPIEZA HOY",
    your_results: "TU PROGRAMA. TUS RESULTADOS.",
    your_results_sub: "Responde 5 preguntas. Te asignamos el programa ideal al instante.",
    create_free: "CREAR CUENTA GRATIS →",
    start_for_free: "EMPIEZA GRATIS →",
    view_programs: "VER PROGRAMAS",
    footer_copy: "© 2026 HYBRID MATRIX. TODOS LOS DERECHOS RESERVADOS.",
    footer_sub: "BASADO EN CIENCIA · IA · EN/ES",
  },
};

export function useTranslation(lang = "en") {
  const t = (key, vars = {}) => {
    const str = translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
  };
  return { t };
}

export default translations;
