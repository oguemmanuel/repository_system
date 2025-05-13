"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  Upload,
  Users,
  ChevronRight,
  Bookmark,
  Clock,
  Star,
  User,
  LogOut,
  Settings,
} from "lucide-react"
import PublicSearch from "@/components/public-search"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

// Language data
const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "de", name: "Deutsch" },
]

// Translations for each language
const translations = {
  en: {
    home: "Home",
    about: "About",
    contact: "Contact",
    login: "Log in",
    logout: "Log out",
    profile: "Profile",
    dashboard: "Dashboard",
    settings: "Settings",
    officialResource: "Official Resource Platform",
    title: "Catholic University of Ghana Repository System",
    subtitle:
      "A centralized platform for storing, organizing, and accessing past exam questions, theses, and final year projects.",
    registerNow: "Register Now",
    searchRepository: "Search Repository",
    updatedRegularly: "Updated regularly with the latest academic resources",
    keyResources: "Key Resources Available",
    pastExams: "Past Exam Questions",
    pastExamsDesc: "Access previous semester exam questions for better preparation.",
    thesesProjects: "Theses & Projects",
    thesesProjectsDesc: "Browse through final year projects and theses for research inspiration.",
    easySubmission: "Easy Submission",
    easySubmissionDesc: "Submit your work securely with our streamlined upload process.",
    exploreResources: "Explore Resources",
    browseRepository: "Browse Repository",
    exploreCollection: "Explore our collection of academic resources freely.",
    moreFeatures: "Want to access more features?",
    createAccount: "Create an Account",
    systemFeatures: "System Features",
    featuresTitle: "Features of our Repository System",
    featuresSubtitle: "Our system provides a comprehensive solution for managing academic resources at CUG.",
    centralizedStorage: "Centralized Storage",
    centralizedStorageDesc: "Store all academic resources in one secure location for easy access.",
    advancedSearch: "Advanced Search",
    advancedSearchDesc: "Find resources quickly with our powerful search functionality.",
    userManagement: "User Management",
    userManagementDesc: "Role-based access control for students, faculty, and administrators.",
    fileManagement: "File Management",
    fileManagementDesc: "Upload, download, and organize files with ease.",
    footerText: "A centralized platform for storing, organizing, and accessing academic resources.",
    copyright: "© 2024 Catholic University of Ghana. All rights reserved.",
    quickLinks: "Quick Links",
    legal: "Legal",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    faq: "FAQ",
    help: "Help Center",
    welcomeBack: "Welcome back",
    indexNumber: "Index Number",
    email: "Email",
    role: "Role",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    login: "Connexion",
    logout: "Déconnexion",
    profile: "Profil",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    officialResource: "Plateforme de ressources officielle",
    title: "Système de dépôt de l'Université Catholique du Ghana",
    subtitle:
      "Une plateforme centralisée pour stocker, organiser et accéder aux questions d'examen précédentes, thèses et projets de fin d'études.",
    registerNow: "S'inscrire maintenant",
    searchRepository: "Rechercher dans le dépôt",
    updatedRegularly: "Mis à jour régulièrement avec les dernières ressources académiques",
    keyResources: "Ressources clés disponibles",
    pastExams: "Questions d'examens précédents",
    pastExamsDesc: "Accédez aux questions d'examen des semestres précédents pour une meilleure préparation.",
    thesesProjects: "Thèses et projets",
    thesesProjectsDesc: "Parcourez les projets de fin d'études et les thèses pour l'inspiration de recherche.",
    easySubmission: "Soumission facile",
    easySubmissionDesc: "Soumettez votre travail en toute sécurité avec notre processus de téléchargement rationalisé.",
    exploreResources: "Explorer les ressources",
    browseRepository: "Parcourir le dépôt",
    exploreCollection: "Explorez notre collection de ressources académiques librement.",
    moreFeatures: "Vous voulez accéder à plus de fonctionnalités?",
    createAccount: "Créer un compte",
    systemFeatures: "Fonctionnalités du système",
    featuresTitle: "Fonctionnalités de notre système de dépôt",
    featuresSubtitle: "Notre système fournit une solution complète pour la gestion des ressources académiques à l'UCG.",
    centralizedStorage: "Stockage centralisé",
    centralizedStorageDesc:
      "Stockez toutes les ressources académiques dans un emplacement sécurisé pour un accès facile.",
    advancedSearch: "Recherche avancée",
    advancedSearchDesc: "Trouvez rapidement des ressources avec notre fonctionnalité de recherche puissante.",
    userManagement: "Gestion des utilisateurs",
    userManagementDesc:
      "Contrôle d'accès basé sur les rôles pour les étudiants, les professeurs et les administrateurs.",
    fileManagement: "Gestion des fichiers",
    fileManagementDesc: "Téléchargez, téléchargez et organisez des fichiers facilement.",
    footerText: "Une plateforme centralisée pour stocker, organiser et accéder aux ressources académiques.",
    copyright: "© 2024 Université Catholique du Ghana. Tous droits réservés.",
    quickLinks: "Liens rapides",
    legal: "Légal",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    faq: "FAQ",
    help: "Centre d'aide",
    welcomeBack: "Bon retour",
    indexNumber: "Numéro d'index",
    email: "Email",
    role: "Rôle",
  },
  es: {
    home: "Inicio",
    about: "Acerca de",
    contact: "Contacto",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    profile: "Perfil",
    dashboard: "Panel de control",
    settings: "Configuración",
    officialResource: "Plataforma de recursos oficial",
    title: "Sistema de Repositorio de la Universidad Católica de Ghana",
    subtitle:
      "Una plataforma centralizada para almacenar, organizar y acceder a exámenes pasados, tesis y proyectos de fin de año.",
    registerNow: "Registrarse ahora",
    searchRepository: "Buscar en el repositorio",
    updatedRegularly: "Actualizado regularmente con los últimos recursos académicos",
    keyResources: "Recursos clave disponibles",
    pastExams: "Exámenes pasados",
    pastExamsDesc: "Acceda a preguntas de exámenes de semestres anteriores para una mejor preparación.",
    thesesProjects: "Tesis y proyectos",
    thesesProjectsDesc: "Explore proyectos de fin de año y tesis para inspiración en investigación.",
    easySubmission: "Envío fácil",
    easySubmissionDesc: "Envíe su trabajo de forma segura con nuestro proceso de carga simplificado.",
    exploreResources: "Explorar recursos",
    browseRepository: "Explorar repositorio",
    exploreCollection: "Explore nuestra colección de recursos académicos libremente.",
    moreFeatures: "¿Desea acceder a más funciones?",
    createAccount: "Crear una cuenta",
    systemFeatures: "Características del sistema",
    featuresTitle: "Características de nuestro sistema de repositorio",
    featuresSubtitle: "Nuestro sistema proporciona una solución integral para gestionar recursos académicos en UCG.",
    centralizedStorage: "Almacenamiento centralizado",
    centralizedStorageDesc: "Almacene todos los recursos académicos en una ubicación segura para un acceso fácil.",
    advancedSearch: "Búsqueda avanzada",
    advancedSearchDesc: "Encuentre recursos rápidamente con nuestra potente funcionalidad de búsqueda.",
    userManagement: "Gestión de usuarios",
    userManagementDesc: "Control de acceso basado en roles para estudiantes, profesores y administradores.",
    fileManagement: "Gestión de archivos",
    fileManagementDesc: "Suba, descargue y organice archivos con facilidad.",
    footerText: "Una plataforma centralizada para almacenar, organizar y acceder a recursos académicos.",
    copyright: "© 2024 Universidad Católica de Ghana. Todos los derechos reservados.",
    quickLinks: "Enlaces rápidos",
    legal: "Legal",
    terms: "Términos de servicio",
    privacy: "Política de privacidad",
    faq: "Preguntas frecuentes",
    help: "Centro de ayuda",
    welcomeBack: "Bienvenido de nuevo",
    indexNumber: "Número de índice",
    email: "Correo electrónico",
    role: "Rol",
  },
  pt: {
    home: "Início",
    about: "Sobre",
    contact: "Contato",
    login: "Entrar",
    logout: "Sair",
    profile: "Perfil",
    dashboard: "Painel",
    settings: "Configurações",
    officialResource: "Plataforma de Recursos Oficial",
    title: "Sistema de Repositório da Universidade Católica de Gana",
    subtitle:
      "Uma plataforma centralizada para armazenar, organizar e acessar questões de exames passados, teses e projetos de final de ano.",
    registerNow: "Registrar agora",
    searchRepository: "Pesquisar repositório",
    updatedRegularly: "Atualizado regularmente com os últimos recursos acadêmicos",
    keyResources: "Recursos-chave disponíveis",
    pastExams: "Questões de exames passados",
    pastExamsDesc: "Acesse questões de exames de semestres anteriores para uma melhor preparação.",
    thesesProjects: "Teses e projetos",
    thesesProjectsDesc: "Navegue por projetos de final de ano e teses para inspiração em pesquisa.",
    easySubmission: "Submissão fácil",
    easySubmissionDesc: "Envie seu trabalho com segurança com nosso processo de upload simplificado.",
    exploreResources: "Explorar recursos",
    browseRepository: "Navegar no repositório",
    exploreCollection: "Explore nossa coleção de recursos acadêmicos livremente.",
    moreFeatures: "Deseja acessar mais recursos?",
    createAccount: "Criar uma conta",
    systemFeatures: "Recursos do sistema",
    featuresTitle: "Recursos do nosso sistema de repositório",
    featuresSubtitle: "Nosso sistema fornece uma solução abrangente para gerenciar recursos acadêmicos na UCG.",
    centralizedStorage: "Armazenamento centralizado",
    centralizedStorageDesc: "Armazene todos os recursos acadêmicos em um local seguro para fácil acesso.",
    advancedSearch: "Pesquisa avançada",
    advancedSearchDesc: "Encontre recursos rapidamente com nossa poderosa funcionalidade de pesquisa.",
    userManagement: "Gerenciamento de usuários",
    userManagementDesc: "Controle de acesso baseado em funções para alunos, professores e administradores.",
    fileManagement: "Gerenciamento de arquivos",
    fileManagementDesc: "Faça upload, download e organize arquivos com facilidade.",
    footerText: "Uma plataforma centralizada para armazenar, organizar e acessar recursos acadêmicos.",
    copyright: "© 2024 Universidade Católica de Gana. Todos os direitos reservados.",
    quickLinks: "Links rápidos",
    legal: "Legal",
    terms: "Termos de serviço",
    privacy: "Política de privacidade",
    faq: "Perguntas frequentes",
    help: "Central de ajuda",
    welcomeBack: "Bem-vindo de volta",
    indexNumber: "Número de índice",
    email: "Email",
    role: "Função",
  },
  de: {
    home: "Startseite",
    about: "Über uns",
    contact: "Kontakt",
    login: "Anmelden",
    logout: "Abmelden",
    profile: "Profil",
    dashboard: "Dashboard",
    settings: "Einstellungen",
    officialResource: "Offizielle Ressourcenplattform",
    title: "Repository-System der Katholischen Universität Ghana",
    subtitle:
      "Eine zentrale Plattform zum Speichern, Organisieren und Zugreifen auf vergangene Prüfungsfragen, Abschlussarbeiten und Jahresprojekte.",
    registerNow: "Jetzt registrieren",
    searchRepository: "Repository durchsuchen",
    updatedRegularly: "Regelmäßig mit den neuesten akademischen Ressourcen aktualisiert",
    keyResources: "Verfügbare Schlüsselressourcen",
    pastExams: "Vergangene Prüfungsfragen",
    pastExamsDesc: "Zugriff auf Prüfungsfragen aus früheren Semestern zur besseren Vorbereitung.",
    thesesProjects: "Abschlussarbeiten & Projekte",
    thesesProjectsDesc: "Durchsuchen Sie Jahresprojekte und Abschlussarbeiten für Forschungsinspiration.",
    easySubmission: "Einfache Einreichung",
    easySubmissionDesc: "Reichen Sie Ihre Arbeit sicher mit unserem optimierten Upload-Prozess ein.",
    exploreResources: "Ressourcen erkunden",
    browseRepository: "Repository durchsuchen",
    exploreCollection: "Entdecken Sie unsere Sammlung akademischer Ressourcen frei.",
    moreFeatures: "Möchten Sie auf mehr Funktionen zugreifen?",
    createAccount: "Konto erstellen",
    systemFeatures: "Systemfunktionen",
    featuresTitle: "Funktionen unseres Repository-Systems",
    featuresSubtitle:
      "Unser System bietet eine umfassende Lösung für die Verwaltung akademischer Ressourcen an der KUG.",
    centralizedStorage: "Zentralisierte Speicherung",
    centralizedStorageDesc: "Speichern Sie alle akademischen Ressourcen an einem sicheren Ort für einfachen Zugriff.",
    advancedSearch: "Erweiterte Suche",
    advancedSearchDesc: "Finden Sie schnell Ressourcen mit unserer leistungsstarken Suchfunktion.",
    userManagement: "Benutzerverwaltung",
    userManagementDesc: "Rollenbasierte Zugriffskontrolle für Studenten, Fakultät und Administratoren.",
    fileManagement: "Dateiverwaltung",
    fileManagementDesc: "Laden Sie Dateien hoch, herunter und organisieren Sie sie mit Leichtigkeit.",
    footerText: "Eine zentrale Plattform zum Speichern, Organisieren und Zugreifen auf akademische Ressourcen.",
    copyright: "© 2024 Katholische Universität Ghana. Alle Rechte vorbehalten.",
    quickLinks: "Schnelllinks",
    legal: "Rechtliches",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzrichtlinie",
    faq: "FAQ",
    help: "Hilfezentrum",
    welcomeBack: "Willkommen zurück",
    indexNumber: "Indexnummer",
    email: "E-Mail",
    role: "Rolle",
  },
}

const features = [
  {
    titleKey: "centralizedStorage",
    descriptionKey: "centralizedStorageDesc",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-600",
  },
  {
    titleKey: "advancedSearch",
    descriptionKey: "advancedSearchDesc",
    icon: <Search className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-700",
  },
  {
    titleKey: "userManagement",
    descriptionKey: "userManagementDesc",
    icon: <Users className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-800",
  },
  {
    titleKey: "fileManagement",
    descriptionKey: "fileManagementDesc",
    icon: <FileText className="h-6 w-6 text-white" />,
    bgColor: "bg-blue-900",
  },
]

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const t = translations[currentLanguage]

  useEffect(() => {
    // Check for user in localStorage or sessionStorage
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
      }
    }

    // Fetch current user from API
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            // Update storage with latest user data
            if (localStorage.getItem("user")) {
              localStorage.setItem("user", JSON.stringify(data.user))
            } else {
              sessionStorage.setItem("user", JSON.stringify(data.user))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const handleLanguageChange = (e) => {
    setCurrentLanguage(e.target.value)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        // Clear user data from storage
        localStorage.removeItem("user")
        sessionStorage.removeItem("user")
        setUser(null)

        toast.success("Logged out successfully")
        router.push("/")
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error logging out. Please try again.")
    }
  }

  const getDashboardLink = () => {
    if (!user) return "/dashboard"

    switch (user.role) {
      case "admin":
        return "/dashboard/admin"
      case "supervisor":
        return "/dashboard/supervisor"
      default:
        return "/dashboard/student"
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Modern Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg mr-2">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-800">CUG Repository</span>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-blue-800 font-medium hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-1"
                >
                  {t.home}
                </Link>
                <Link href="/about" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">
                  {t.about}
                </Link>
                <Link href="/contact" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">
                  {t.contact}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="bg-gray-100 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentLanguage}
                onChange={handleLanguageChange}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {loading ? (
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-blue-600 cursor-pointer">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName} />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white" align="end" forceMount>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {t.welcomeBack}, {user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="flex flex-col items-start p-2">
                        <span className="text-xs text-muted-foreground">{t.email}</span>
                        <span className="text-sm truncate w-full">{user.email}</span>
                      </DropdownMenuItem>
                      {user.indexNumber && (
                        <DropdownMenuItem className="flex flex-col items-start p-2">
                          <span className="text-xs text-muted-foreground">{t.indexNumber}</span>
                          <span className="text-sm">{user.indexNumber}</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="flex flex-col items-start p-2">
                        <span className="text-xs text-muted-foreground">{t.role}</span>
                        <span className="text-sm capitalize">{user.role}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <Link href={getDashboardLink()}>
                        <DropdownMenuItem className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t.dashboard}</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t.settings}</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">{t.login}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2 space-y-6">
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
                {t.officialResource}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{t.title}</h1>
              <p className="text-lg text-gray-600 max-w-2xl">{t.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!user && (
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3">
                      <Users className="mr-2 h-4 w-4" />
                      {t.registerNow}
                    </Button>
                  </Link>
                )}
                <Link href="#search-section">
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6 py-3"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {t.searchRepository}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-4">
                <Clock className="mr-2 h-4 w-4" />
                <span>{t.updatedRegularly}</span>
              </div>
            </div>

            {/* Resources Card */}
            <div className="lg:w-1/2">
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-blue-600 p-4 text-white">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {t.keyResources}
                  </h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    <div className="flex items-center gap-4 p-6 hover:bg-blue-50 transition-colors">
                      <div className="rounded-lg bg-blue-100 p-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800">{t.pastExams}</h3>
                        <p className="text-sm text-gray-600">{t.pastExamsDesc}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-4 p-6 hover:bg-blue-50 transition-colors">
                      <div className="rounded-lg bg-blue-100 p-3">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800">{t.thesesProjects}</h3>
                        <p className="text-sm text-gray-600">{t.thesesProjectsDesc}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-4 p-6 hover:bg-blue-50 transition-colors">
                      <div className="rounded-lg bg-blue-100 p-3">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800">{t.easySubmission}</h3>
                        <p className="text-sm text-gray-600">{t.easySubmissionDesc}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800 mb-4">
              <Search className="mr-2 h-4 w-4" /> {t.exploreResources}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.browseRepository}</h2>
            <p className="text-lg text-gray-600">{t.exploreCollection}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <PublicSearch />
          </div>

          {!user && (
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">{t.moreFeatures}</p>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  <Users className="mr-2 h-4 w-4" />
                  {t.createAccount}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800 mb-4">
              <Bookmark className="mr-2 h-4 w-4" /> {t.systemFeatures}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-gray-600">{t.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.titleKey} className="shadow-md hover:shadow-lg transition-shadow border-0">
                <div className={`${feature.bgColor} h-2 w-full`}></div>
                <CardContent className="p-6">
                  <div className={`${feature.bgColor} rounded-lg p-3 inline-flex mb-4`}>{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t[feature.titleKey]}</h3>
                  <p className="text-gray-600">{t[feature.descriptionKey]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">CUG Repository</span>
              </div>
              <p className="text-gray-400 mb-4">{t.footerText}</p>
              <p className="text-gray-400 text-sm">{t.copyright}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">{t.quickLinks}</h3>
              <div className="space-y-3">
                <Link href="/" className="text-gray-400 hover:text-white block transition-colors">
                  {t.home}
                </Link>
                <Link href="/about" className="text-gray-400 hover:text-white block transition-colors">
                  {t.about}
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-white block transition-colors">
                  {t.contact}
                </Link>
                <Link href="/register" className="text-gray-400 hover:text-white block transition-colors">
                  {t.registerNow}
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">{t.legal}</h3>
              <div className="space-y-3">
                <Link href="/terms" className="text-gray-400 hover:text-white block transition-colors">
                  {t.terms}
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white block transition-colors">
                  {t.privacy}
                </Link>
                <Link href="/faq" className="text-gray-400 hover:text-white block transition-colors">
                  {t.faq}
                </Link>
                <Link href="/help" className="text-gray-400 hover:text-white block transition-colors">
                  {t.help}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
